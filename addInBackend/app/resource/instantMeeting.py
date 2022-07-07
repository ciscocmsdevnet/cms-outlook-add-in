from copy import copy
from random import randint
import requests
import config
from fastapi import  HTTPException
from requests.auth import HTTPBasicAuth
import xmltodict
import logging as log
import json
from fastapi.responses import JSONResponse
from resource.template import extractCoSpaceTemplateinfo
from os import environ

log.basicConfig(level="INFO")

admin_auth = HTTPBasicAuth(config.WEB_ADMIN_USERNAME, config.WEB_ADMIN_PASSWORD)

def findUserByCMSJID(userjid):
  filteruserURL = f"{config.WEB_ADMIN}/api/v1/users?filter={userjid}"
  try:
    response = requests.request("GET", filteruserURL, auth=admin_auth,verify=False)
  except ConnectionError:
    raise HTTPException(status_code=400, detail="Invalid URL provided")
  except Exception as getUserEx:
    log.error(f"Exception occured while filtering User: {getUserEx}")
    raise HTTPException(status_code=500, detail="Internal Error")
  else:
    log.info(f"METHOD: GET, URL: {filteruserURL}, Response_Status: {response.status_code}")
    if response.status_code == 401:
      raise HTTPException(status_code=401, detail="Invalid username/password provided")
    elif response.status_code == 307:
      return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
    elif response.status_code == 200:
      json_response = json.loads(json.dumps(xmltodict.parse(response.content)))
      if int(json_response["users"]["@total"]) == 1:
        return json_response["users"]["user"]
      elif int(json_response["users"]["@total"]) == 0:
        return JSONResponse(content={"detail": "User Not Found"} , status_code=404) 
      elif int(json_response["users"]["@total"]) > 1:
        return JSONResponse(content={"detail": "JID did not return unique user"} , status_code=300)    


def getEmailInvitationFromSpaceID(coSpaceId,instant=False):

  json_response = None

  AccessMethodDetailURL=f"{config.WEB_ADMIN}/api/v1/coSpaces/{coSpaceId}/accessMethods"
  try:
    response = requests.request("GET", AccessMethodDetailURL, auth=admin_auth,verify=False)
  except ConnectionError:
    raise HTTPException(status_code=400, detail="Invalid URL provided")
  except Exception as getUserEx:
    log.error(f"Exception occured while filtering User: {getUserEx}")
    raise HTTPException(status_code=500, detail="Internal Error")
  else:
    log.info(f"METHOD: GET, URL: {AccessMethodDetailURL}, Response_Status: {response.status_code}")
    if response.status_code == 401:
      raise HTTPException(status_code=401, detail="Invalid username/password provided")
    elif response.status_code == 307:
      return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
    elif response.status_code == 200:
      json_response = json.loads(json.dumps(xmltodict.parse(response.content)))

      ## Get Email Invitation From CoSpaces
      #print (json_response)
      if type(json_response["accessMethods"]["accessMethod"]) is list:
        accessMethodID = json_response["accessMethods"]["accessMethod"][0]["@id"] ## we always pick the first accessMethod
      else:
        accessMethodID = json_response["accessMethods"]["accessMethod"]["@id"]

      meetingDetailURL=f"{config.WEB_ADMIN}/api/v1/coSpaces/{coSpaceId}/accessMethods/{accessMethodID}/emailInvitation?language={environ['INVITATION_LANG']}"
      try:
        response = requests.request("GET", meetingDetailURL, auth=admin_auth,verify=False)
      except ConnectionError:
        raise HTTPException(status_code=400, detail="Invalid URL provided")
      except Exception as getUserEx:
        log.error(f"Exception occured while filtering User: {getUserEx}")
        raise HTTPException(status_code=500, detail="Internal Error")
      else:
        log.info(f"METHOD: GET ,URL: {meetingDetailURL}, Response_Status: {response.status_code}")
        if response.status_code == 401:
          raise HTTPException(status_code=401, detail="Invalid username/password provided")
        elif response.status_code == 307:
          return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
        elif response.status_code == 200:
          json_response = json.loads(json.dumps(xmltodict.parse(response.content)))
      
      access_method_json_response = None
      if instant:
        accessMethodDetailURL=f"{config.WEB_ADMIN}/api/v1/coSpaces/{coSpaceId}/accessMethods/{accessMethodID}"
        try:
          response = requests.request("GET", accessMethodDetailURL, auth=admin_auth,verify=False)
        except ConnectionError:
          raise HTTPException(status_code=400, detail="Invalid URL provided")
        except Exception as getUserEx:
          log.error(f"Exception occured while filtering User: {getUserEx}")
          raise HTTPException(status_code=500, detail="Internal Error")
        else:
          log.info(f"METHOD: GET ,URL: {accessMethodDetailURL}, Response_Status: {response.status_code}")
          if response.status_code == 401:
            raise HTTPException(status_code=401, detail="Invalid username/password provided")
          elif response.status_code == 307:
            return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
          elif response.status_code == 200:
            access_method_json_response = json.loads(json.dumps(xmltodict.parse(response.content)))

  finally:
    return (json_response,access_method_json_response)

def getMeetingInformationFromProvisionedCoSpace(jid,id,dbObject):

  ## Check for Provisioned coSpace
  spaceDetailURL=f"{config.WEB_ADMIN}/api/v1/users/{id}/userProvisionedcoSpaces"
  try:
    response = requests.request("GET", spaceDetailURL, auth=admin_auth,verify=False)
  except ConnectionError:
    raise HTTPException(status_code=400, detail="Invalid URL provided")
  except Exception as getUserEx:
    log.error(f"Exception occured while filtering User: {getUserEx}")
    raise HTTPException(status_code=500, detail="Internal Error")
  else:
    log.info(f"METHOD: GET ,URL: {spaceDetailURL}, Response_Status: {response.status_code}")
    if response.status_code == 401:
      raise HTTPException(status_code=401, detail="Invalid username/password provided")
    elif response.status_code == 307:
      return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
    elif response.status_code == 200:
      json_response = json.loads(json.dumps(xmltodict.parse(response.content)))

      ## Get Access Methods from coSpaces
      if "userProvisionedCoSpace" in json_response["userProvisionedCoSpaces"].keys():
        pass
      else:
        ## check if total is 0
        if "@total" in json_response["userProvisionedCoSpaces"].keys():
          if int(json_response["userProvisionedCoSpaces"]['@total']) == 0:
            raise HTTPException(status_code=404, detail="No associated Co-Space found")
      coSpaceID = json_response["userProvisionedCoSpaces"]["userProvisionedCoSpace"]["coSpace"]
      
      emailInvitationResponse = getEmailInvitationFromSpaceID (coSpaceID)
      
      if "emailInvitation" in emailInvitationResponse[0].keys():
        payload = {
              "subject": emailInvitationResponse[0]["emailInvitation"]["subject"],
              "details": emailInvitationResponse[0]["emailInvitation"]["invitation"]
            }
        responseMeetingInfo = {
          "username": jid,
          "meetingInfo": payload
        }
        dbpayload = copy(payload)
        dbpayload['coSpaceID'] = coSpaceID
        ## Store in DB
        try:
          dbObject.set(jid,json.dumps(dbpayload))
        except Exception as dbInsertExp:
          log.error(f"Cannot Store Meeting Info in DB:{dbInsertExp}")
          pass
        return JSONResponse(content=responseMeetingInfo, status_code=200)
      else:
        log.error("Error in fetching Email invitation")
        raise HTTPException(status_code=500, detail="Internal Error")


def findSpaceIfExist(spaceName):

  foundSpaceId = None

  findSpace=f"{config.WEB_ADMIN}/api/v1/coSpaces?filter={spaceName}"
  try:
    response = requests.request("GET", findSpace,auth=admin_auth,verify=False)
  except ConnectionError:
    raise HTTPException(status_code=400, detail="Invalid URL provided")
  except Exception as getUserEx:
    log.error(f"Exception occured while filtering User: {getUserEx}")
    raise HTTPException(status_code=500, detail="Internal Error")
  else:
    log.info(f"METHOD: GET ,URL: {findSpace}, Response_Status: {response.status_code}")
    if response.status_code == 401:
      raise HTTPException(status_code=401, detail="Invalid username/password provided")
    elif response.status_code == 307:
      return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
    elif response.status_code == 200:
      json_response = json.loads(json.dumps(xmltodict.parse(response.content)))
      if int(json_response['coSpaces']['@total']) == 0:
        pass ## Create Space as it does not exist
      elif int(json_response['coSpaces']['@total']) == 1:
        foundSpaceId = json_response['coSpaces']['coSpace']['@id'] ## Picking the already created Space and providing details
      else:
        foundSpaceId = json_response['coSpaces']['coSpace'][0]['@id'] ## Picking the first space and providing details

  finally:
    return foundSpaceId


def createMeetingSpaceForUser(cjid,cdbObject):

  ## Check if coSpace Template is defined or not:
  ## Get information from DB for Space Template
  if config.SPACE_TEMPLATE:
    ## Fetch Template details:
    try:
      spaceTemplateInfo = cdbObject.get(config.SPACE_TEMPLATE)
    except Exception as dbInsertExp:
      log.error(f"Cannot Find Space Template Info in DB:{dbInsertExp}")
      pass
    else:
      if spaceTemplateInfo: ## ie record exist
        log.info(f"Record present in DB, fetched from there")
      else:
        spaceTemplateInfo = extractCoSpaceTemplateinfo(cdbObject)
    
    ## Checking if space already exist
    foundSpaceId = findSpaceIfExist(spaceName=f"{cjid.split('@')[0]}_Meeting_Space")
    
    if foundSpaceId:
      log.info(f"Space found. Fetching details..{foundSpaceId}")
      emailInvitationResponse = getEmailInvitationFromSpaceID (foundSpaceId,instant=True)
      
      if "emailInvitation" in emailInvitationResponse[0].keys():

        generatedLink = f"{config.meetingLink}/{emailInvitationResponse[1]['accessMethod']['callId']}?secret={emailInvitationResponse[1]['accessMethod']['secret']}"
        modifiedMeetinLinkInformation = emailInvitationResponse[0]["emailInvitation"]["invitation"].replace('\n',f'\nJoin Link: {generatedLink}\n',1)

        payload = {
              "subject": emailInvitationResponse[0]["emailInvitation"]["subject"],
              "details": modifiedMeetinLinkInformation
            }
        responseMeetingInfo = {
          "username": cjid,
          "meetingInfo": payload
        }
        dbpayload = copy(payload)
        dbpayload['coSpaceID'] = foundSpaceId
        ## Store in DB
        try:
          cdbObject.set(cjid,json.dumps(dbpayload))
        except Exception as dbInsertExp:
          log.error(f"Cannot Store Meeting Info in DB:{dbInsertExp}")
          pass
        return JSONResponse(content=responseMeetingInfo, status_code=200)
      else:
        log.error("Cannot Fetch already created Space")
        raise HTTPException(status_code=500, detail="Internal Error")
    
    else:
      log.info(f"METHOD: ,No Space found.Creating New Space..")
      ## Create new space with parameters from template
      if spaceTemplateInfo:
        if type(spaceTemplateInfo) == str:
          spaceTemplateInfo = json.loads(spaceTemplateInfo)
        
        payload = f'name={cjid.split("@")[0]}_Meeting_Space&ownerJid={cjid}&nonMemberAccess=true'

        if ("callProfile" in spaceTemplateInfo["coSpaceTemplate"].keys()) and ("callLegProfile" in spaceTemplateInfo["coSpaceTemplate"].keys()):

          payload=f'{payload}&callProfile={spaceTemplateInfo["coSpaceTemplate"]["callProfile"]}&callLegProfile={spaceTemplateInfo["coSpaceTemplate"]["callLegProfile"]}'

        headers = {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
        createSpaceURL = f"{config.WEB_ADMIN}/api/v1/coSpaces"

        newCoSpaceID = None
        try:
          response = requests.request("POST", createSpaceURL, headers=headers, data=payload,auth=admin_auth,verify=False)
        except ConnectionError:
          raise HTTPException(status_code=400, detail="Invalid URL provided")
        except Exception as getUserEx:
          log.error(f"Exception occured while filtering User: {getUserEx}")
          raise HTTPException(status_code=500, detail="Internal Error")
        else:
          log.info(f"METHOD: POST ,URL: {createSpaceURL}, Response_Status: {response.status_code}")
          if response.status_code == 401:
            raise HTTPException(status_code=401, detail="Invalid username/password provided")
          elif response.status_code == 307:
            return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
          elif response.status_code == 200:
            newCoSpaceID = response.headers['Location'].split('/')[4]
        
        if newCoSpaceID:
          ## create coSpaceUsers
          paylodCoSpaceUser = f'userJid={cjid}'
          coSpaceUserURL = f"{config.WEB_ADMIN}/api/v1/coSpaces/{newCoSpaceID}/coSpaceUsers"
          try:
            response = requests.request("POST", coSpaceUserURL, headers=headers, data=paylodCoSpaceUser,auth=admin_auth,verify=False)
          except ConnectionError:
            raise HTTPException(status_code=400, detail="Invalid URL provided")
          except Exception as getUserEx:
            log.error(f"Exception occured while filtering User: {getUserEx}")
            raise HTTPException(status_code=500, detail="Internal Error")
          else:
            log.info(f"METHOD: POST ,URL: {coSpaceUserURL}, Response_Status: {response.status_code}")
            if response.status_code == 401:
              raise HTTPException(status_code=401, detail="Invalid username/password provided")
            elif response.status_code == 307:
              return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
            elif response.status_code == 200:
              pass

          ## Create Access Method

          newCoSpaceAccessMethodID = None

          if config.CALL_ID_PREFIX==None:
            prefix = '12985'
          else:
            prefix = config.CALL_ID_PREFIX

          ## Creating the Payload depending on response received
          payloadAccessMethod = f"uri={cjid.split('@')[0]}.meeting.space&callId={prefix}{randint(10000,99999)}"
          if int(spaceTemplateInfo['coSpaceTemplate']['numAccessMethodTemplates']) == 0:
            pass

          elif int(spaceTemplateInfo['coSpaceTemplate']['numAccessMethodTemplates']) == 1:
            payloadAccessMethod = f"{payloadAccessMethod}&name={spaceTemplateInfo['accessMethod']['name']}"
            if "callLegProfile" in spaceTemplateInfo['accessMethod'].keys():
              payloadAccessMethod = f"{payloadAccessMethod}&callLegProfile={spaceTemplateInfo['accessMethod']['callLegProfile']}"
            if "dialInSecurityProfile" in spaceTemplateInfo['accessMethod'].keys():
              payloadAccessMethod = f"{payloadAccessMethod}&dialInSecurityProfile={spaceTemplateInfo['accessMethod']['dialInSecurityProfile']}"
          
          elif int(spaceTemplateInfo['coSpaceTemplate']['numAccessMethodTemplates']) > 1:
            payloadAccessMethod = f"{payloadAccessMethod}&name={spaceTemplateInfo['accessMethod'][0]['name']}"
            if "callLegProfile" in spaceTemplateInfo['accessMethod'][0].keys():
              payloadAccessMethod = f"{payloadAccessMethod}&callLegProfile={spaceTemplateInfo['accessMethod'][0]['callLegProfile']}"
            if "dialInSecurityProfile" in spaceTemplateInfo['accessMethod'][0].keys():
              payloadAccessMethod = f"{payloadAccessMethod}&dialInSecurityProfile={spaceTemplateInfo['accessMethod'][0]['dialInSecurityProfile']}"


          coSpaceUserAccessMethodURL = f"{config.WEB_ADMIN}/api/v1/coSpaces/{newCoSpaceID}/accessMethods"

          try:
            response = requests.request("POST", coSpaceUserAccessMethodURL, headers=headers, data=payloadAccessMethod,auth=admin_auth,verify=False)
          except ConnectionError:
            raise HTTPException(status_code=400, detail="Invalid URL provided")
          except Exception as getUserEx:
            log.error(f"Exception occured while filtering User: {getUserEx}")
            raise HTTPException(status_code=500, detail="Internal Error")
          else:
            log.info(f"METHOD: POST,URL: {coSpaceUserAccessMethodURL}, Response_Status: {response.status_code}")

            if response.status_code == 401:
              raise HTTPException(status_code=401, detail="Invalid username/password provided")
            elif response.status_code == 307:
              return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
            elif response.status_code == 200:
              newCoSpaceAccessMethodID = response.headers['Location'].split('/')[6]

          ## Get meeting Information
          if newCoSpaceAccessMethodID:
            meetingDetailURL=f"{config.WEB_ADMIN}/api/v1/coSpaces/{newCoSpaceID}/accessMethods/{newCoSpaceAccessMethodID}/emailInvitation?language={environ['INVITATION_LANG']}"

            try:
              response = requests.request("GET", meetingDetailURL, auth=admin_auth,verify=False)
            
            except ConnectionError:
              raise HTTPException(status_code=400, detail="Invalid URL provided")
            except Exception as getUserEx:
              log.error(f"Exception occured while filtering User: {getUserEx}")
              raise HTTPException(status_code=500, detail="Internal Error")
            else:
              log.info(f"METHOD: GET ,URL: {meetingDetailURL}, Response_Status: {response.status_code}")
              if response.status_code == 401:
                raise HTTPException(status_code=401, detail="Invalid username/password provided")
              elif response.status_code == 307:
                return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
              elif response.status_code == 200:
                json_response = json.loads(json.dumps(xmltodict.parse(response.content)))


              accessMethodDetailURL=f"{config.WEB_ADMIN}/api/v1/coSpaces/{newCoSpaceID}/accessMethods/{newCoSpaceAccessMethodID}"
              try:
                response = requests.request("GET", accessMethodDetailURL, auth=admin_auth,verify=False)
              except ConnectionError:
                raise HTTPException(status_code=400, detail="Invalid URL provided")
              except Exception as getUserEx:
                log.error(f"Exception occured while filtering User: {getUserEx}")
                raise HTTPException(status_code=500, detail="Internal Error")
              else:
                log.info(f"METHOD: GET ,URL: {accessMethodDetailURL}, Response_Status: {response.status_code}")
                if response.status_code == 401:
                  raise HTTPException(status_code=401, detail="Invalid username/password provided")
                elif response.status_code == 307:
                  return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
                elif response.status_code == 200:
                  access_method_json_response = json.loads(json.dumps(xmltodict.parse(response.content)))


                generatedLink = f"{config.meetingLink}/{access_method_json_response['accessMethod']['callId']}?secret={access_method_json_response['accessMethod']['secret']}"
                modifiedMeetinLinkInformation =json_response["emailInvitation"]["invitation"].replace('\n',f'\nJoin Link: {generatedLink}\n',1)

                payload = {
                  "subject": json_response["emailInvitation"]["subject"],
                  "details": modifiedMeetinLinkInformation
                }
                responseMeetingInfo = {
                  "username": cjid,
                  "meetingInfo": payload
                }
                dbpayload = copy(payload)
                dbpayload['coSpaceID'] = newCoSpaceID
                ## Store in DB
                try:
                  cdbObject.set(cjid,json.dumps(dbpayload))
                except Exception as dbInsertExp:
                  log.error(f"Cannot Store Meeting Info in DB:{dbInsertExp}")
                  pass
                return JSONResponse(content=responseMeetingInfo, status_code=200)
      else:
        raise HTTPException(status_code=500, detail="No coSpace template found in configs...")



def getUserMeetingInformation(userjid,dbObject):

  userDetails = findUserByCMSJID(userjid)

  if type(userDetails) is dict:
    userID = userDetails["@id"]
    if config.PROVISIONED_COSPACES:
      ## Admins have defined user coSpaces, checking those first
      return getMeetingInformationFromProvisionedCoSpace(userjid,userID,dbObject)
    else:
      ## Need to create a space for user
      return createMeetingSpaceForUser(userjid,dbObject)
  else:
    return userDetails