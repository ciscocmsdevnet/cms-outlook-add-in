from random import randint
import requests
import config
from fastapi import  HTTPException
from requests.auth import HTTPBasicAuth
import xmltodict
import logging
import json
from fastapi.responses import JSONResponse
from resource.template import extractCoSpaceTemplateinfo


def findUserByCMSJID(userjid):
  filteruserURL = f"{config.WEB_ADMIN}/api/v1/users?filter={userjid}"
  try:
    response = requests.request("GET", filteruserURL, auth=HTTPBasicAuth(config.WEB_ADMIN_USERNAME, config.WEB_ADMIN_PASSWORD),verify=False)
  except ConnectionError:
    raise HTTPException(status_code=400, detail="Invalid URL provided")
  except Exception as getUserEx:
    print (f"Exception occured while filtering User: {getUserEx}")
    raise HTTPException(status_code=500, detail="Internal Error")
  else:
    logging.warning(f"URL: {filteruserURL}, Response_Status: {response.status_code}")
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


def getMeetingInformationFromProvisionedCoSpace(jid,id,dbObject):

  ## Check for Provisioned coSpace
  spaceDetailURL=f"{config.WEB_ADMIN}/api/v1/users/{id}/userProvisionedcoSpaces"
  try:
    response = requests.request("GET", spaceDetailURL, auth=HTTPBasicAuth(config.WEB_ADMIN_USERNAME, config.WEB_ADMIN_PASSWORD),verify=False)
  except ConnectionError:
    raise HTTPException(status_code=400, detail="Invalid URL provided")
  except Exception as getUserEx:
    print (f"Exception occured while filtering User: {getUserEx}")
    raise HTTPException(status_code=500, detail="Internal Error")
  else:
    logging.warning(f"URL: {spaceDetailURL}, Response_Status: {response.status_code}")
    if response.status_code == 401:
      raise HTTPException(status_code=401, detail="Invalid username/password provided")
    elif response.status_code == 307:
      return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
    elif response.status_code == 200:
      json_response = json.loads(json.dumps(xmltodict.parse(response.content)))

      ## Get Access Methods from coSpaces
      coSpaceID = json_response["userProvisionedCoSpaces"]["userProvisionedCoSpace"]["coSpace"]
      AccessMethodDetailURL=f"{config.WEB_ADMIN}/api/v1/coSpaces/{coSpaceID}/accessMethods"
      try:
        response = requests.request("GET", AccessMethodDetailURL, auth=HTTPBasicAuth(config.WEB_ADMIN_USERNAME, config.WEB_ADMIN_PASSWORD),verify=False)
      except ConnectionError:
        raise HTTPException(status_code=400, detail="Invalid URL provided")
      except Exception as getUserEx:
        print (f"Exception occured while filtering User: {getUserEx}")
        raise HTTPException(status_code=500, detail="Internal Error")
      else:
        logging.warning(f"URL: {AccessMethodDetailURL}, Response_Status: {response.status_code}")
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

          meetingDetailURL=f"{config.WEB_ADMIN}/api/v1/coSpaces/{coSpaceID}/accessMethods/{accessMethodID}/emailInvitation"
          try:
            response = requests.request("GET", meetingDetailURL, auth=HTTPBasicAuth(config.WEB_ADMIN_USERNAME, config.WEB_ADMIN_PASSWORD),verify=False)
          except ConnectionError:
            raise HTTPException(status_code=400, detail="Invalid URL provided")
          except Exception as getUserEx:
            print (f"Exception occured while filtering User: {getUserEx}")
            raise HTTPException(status_code=500, detail="Internal Error")
          else:
            logging.warning(f"URL: {meetingDetailURL}, Response_Status: {response.status_code}")
            if response.status_code == 401:
              raise HTTPException(status_code=401, detail="Invalid username/password provided")
            elif response.status_code == 307:
              return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
            elif response.status_code == 200:
              json_response = json.loads(json.dumps(xmltodict.parse(response.content)))
              payload = {
                "subject": json_response["emailInvitation"]["subject"],
                "details": json_response["emailInvitation"]["invitation"]
              }
              responseMeetingInfo = {
                "username": jid,
                "meetingInfo": payload
              }
              ## Store in DB
              try:
                dbObject.set(jid,json.dumps(payload))
              except Exception as dbInsertExp:
                logging.error(f"Cannot Store Meeting Info in DB:{dbInsertExp}")
                pass
              return JSONResponse(content=responseMeetingInfo, status_code=200)


def createMeetingSpaceForUser(cjid,cid,cdbObject):

  ## Check if coSpace Template is defined or not:
  ## Get information from DB for Space Template
  if config.SPACE_TEMPLATE:
    ## Fetch Template details:
    try:
      spaceTemplateInfo = cdbObject.get(config.SPACE_TEMPLATE)
    except Exception as dbInsertExp:
      logging.error(f"Cannot Find Space Template Info in DB:{dbInsertExp}")
      pass
    else:
      if spaceTemplateInfo: ## ie record exist
        logging.info(f"Record present in DB, fetched from there")
      else:
        spaceTemplateInfo = extractCoSpaceTemplateinfo(cdbObject)
    
    ## Create new space with parameters from template
    if spaceTemplateInfo:
      if type(spaceTemplateInfo) == str:
        spaceTemplateInfo = json.loads(spaceTemplateInfo)
      payload=f'name={cjid.split("@")[0]}_Meeting_Space&ownerJid={cjid}&callProfile={spaceTemplateInfo["coSpaceTemplate"]["callProfile"]}&callLegProfile={spaceTemplateInfo["coSpaceTemplate"]["callLegProfile"]}&nonMemberAccess=true'
      headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
      createSpaceURL = f"{config.WEB_ADMIN}/api/v1/coSpaces"

      newCoSpaceID = None
      try:
        response = requests.request("POST", createSpaceURL, headers=headers, data=payload,auth=HTTPBasicAuth(config.WEB_ADMIN_USERNAME, config.WEB_ADMIN_PASSWORD),verify=False)
      except ConnectionError:
        raise HTTPException(status_code=400, detail="Invalid URL provided")
      except Exception as getUserEx:
        print (f"Exception occured while filtering User: {getUserEx}")
        raise HTTPException(status_code=500, detail="Internal Error")
      else:
        logging.warning(f"URL: {createSpaceURL}, Response_Status: {response.status_code}")
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
          response = requests.request("POST", coSpaceUserURL, headers=headers, data=paylodCoSpaceUser,auth=HTTPBasicAuth(config.WEB_ADMIN_USERNAME, config.WEB_ADMIN_PASSWORD),verify=False)
        except ConnectionError:
          raise HTTPException(status_code=400, detail="Invalid URL provided")
        except Exception as getUserEx:
          print (f"Exception occured while filtering User: {getUserEx}")
          raise HTTPException(status_code=500, detail="Internal Error")
        else:
          logging.warning(f"URL: {coSpaceUserURL}, Response_Status: {response.status_code}")
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
        payloadAccessMethod = f"uri={cjid.split('@')[0]}.meeting.space&callLegProfile={spaceTemplateInfo['accessMethod']['callLegProfile']}&dialInSecurityProfile={spaceTemplateInfo['accessMethod']['dialInSecurityProfile']}&name={spaceTemplateInfo['accessMethod']['name']}&callId={prefix}{randint(10000,99999)}"

        coSpaceUserAccessMethodURL = f"{config.WEB_ADMIN}/api/v1/coSpaces/{newCoSpaceID}/accessMethods"
        print(payloadAccessMethod)
        try:
          response = requests.request("POST", coSpaceUserAccessMethodURL, headers=headers, data=payloadAccessMethod,auth=HTTPBasicAuth(config.WEB_ADMIN_USERNAME, config.WEB_ADMIN_PASSWORD),verify=False)
        except ConnectionError:
          raise HTTPException(status_code=400, detail="Invalid URL provided")
        except Exception as getUserEx:
          print (f"Exception occured while filtering User: {getUserEx}")
          raise HTTPException(status_code=500, detail="Internal Error")
        else:
          logging.warning(f"URL: {coSpaceUserAccessMethodURL}, Response_Status: {response.status_code}")
          if response.status_code == 401:
            raise HTTPException(status_code=401, detail="Invalid username/password provided")
          elif response.status_code == 307:
            return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
          elif response.status_code == 200:
            newCoSpaceAccessMethodID = response.headers['Location'].split('/')[6]

        ## Get meeting Information
        if newCoSpaceAccessMethodID:
          meetingDetailURL=f"{config.WEB_ADMIN}/api/v1/coSpaces/{newCoSpaceID}/accessMethods/{newCoSpaceAccessMethodID}/emailInvitation"
          try:
            response = requests.request("GET", meetingDetailURL, auth=HTTPBasicAuth(config.WEB_ADMIN_USERNAME, config.WEB_ADMIN_PASSWORD),verify=False)
          except ConnectionError:
            raise HTTPException(status_code=400, detail="Invalid URL provided")
          except Exception as getUserEx:
            print (f"Exception occured while filtering User: {getUserEx}")
            raise HTTPException(status_code=500, detail="Internal Error")
          else:
            logging.warning(f"URL: {meetingDetailURL}, Response_Status: {response.status_code}")
            if response.status_code == 401:
              raise HTTPException(status_code=401, detail="Invalid username/password provided")
            elif response.status_code == 307:
              return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
            elif response.status_code == 200:
              json_response = json.loads(json.dumps(xmltodict.parse(response.content)))
              payload = {
                "subject": json_response["emailInvitation"]["subject"],
                "details": json_response["emailInvitation"]["invitation"]
              }
              responseMeetingInfo = {
                "username": cjid,
                "meetingInfo": payload
              }
              ## Store in DB
              try:
                cdbObject.set(cjid,json.dumps(payload))
              except Exception as dbInsertExp:
                logging.error(f"Cannot Store Meeting Info in DB:{dbInsertExp}")
                pass
              return JSONResponse(content=responseMeetingInfo, status_code=200)
    else:
      raise HTTPException(status_code=500, detail="No coSpace template found in configs...")
  else:
    raise HTTPException(status_code=500, detail="No coSpace template found in configs...")
  return



def getUserMeetingInformation(userjid,dbObject):

  userDetails = findUserByCMSJID(userjid)

  if type(userDetails) is dict:
    userID = userDetails["@id"]
    if config.PROVISIONED_COSPACES:
      ## Admins have defined user coSpaces, checking those first
      return getMeetingInformationFromProvisionedCoSpace(userjid,userID,dbObject)
    else:
      ## Need to create a space for user
      return createMeetingSpaceForUser(userjid,userID,dbObject)
  else:
    return userDetails