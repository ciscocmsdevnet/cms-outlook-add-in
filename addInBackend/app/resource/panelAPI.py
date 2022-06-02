import requests
import json
from fastapi import HTTPException, APIRouter
from schemas.panel import *
import logging
from requests.exceptions import ConnectionError
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

router = APIRouter()

@router.post("/login/")
async def addInLogin(userData: loginPayload):

    web_bridge_url = f"https://{userData.webBridgeURL}/api/auth"

    payload = json.dumps({
      "username": userData.username,
      "password": userData.password,
      "trace": False
    })
    headers = {
      'Content-Type': 'application/json'
    }
    try:
      response = requests.request("POST", web_bridge_url, headers=headers, data=payload, verify=False)

    except ConnectionError:
      raise HTTPException(status_code=400, detail="Invalid web bridge URL provided")
    except Exception as loginEx:
      print (f"Exception occured while login: {loginEx}")
    else:
      logging.warning(f"URL: {web_bridge_url}, Response_Status: {response.status_code}, user: {userData.username} ")
      if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid username/password provided")
      elif response.status_code == 307:
        return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
      elif response.status_code == 200:
        return response.json()

@router.post("/getUserSpaces/")
async def getSpaces(getSpacesInput: getSpacesInput):

    web_bridge_url = f"https://{getSpacesInput.webBridgeURL}/api/cospaces"

    headers = {'Authorization': f'Bearer {getSpacesInput.authToken}'}

    try:
      response = requests.request("GET", web_bridge_url, headers=headers, verify=False)
      

    except ConnectionError:
      raise HTTPException(status_code=400, detail="Invalid web bridge URL provided")
    except Exception as getSpaceExc:
      print (f"Exception occured while getting spaces: {getSpaceExc}")
    else:
      logging.warning(f"URL: {web_bridge_url}, Response_Status: {response.status_code}")
      if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid username/password provided")
      elif response.status_code == 307:
        return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
      elif response.status_code == 200:
        return response.json()

@router.post("/getSpaceAccessMethods/")
async def getSpaceAccessMethod(getSpaceAccessMethodInput: getSpaceAccessMethodInput):

    web_bridge_url = f"https://{getSpaceAccessMethodInput.webBridgeURL}/api/cospaces/{getSpaceAccessMethodInput.spaceGUID}"

    headers = {'Authorization': f'Bearer {getSpaceAccessMethodInput.authToken}'}

    try:
      response = requests.request("GET", web_bridge_url, headers=headers, verify=False)

    except ConnectionError:
      raise HTTPException(status_code=400, detail="Invalid web bridge URL provided")
    except Exception as getSpaceAMExc:
      print (f"Exception occured while getting spaces access methods: {getSpaceAMExc}")
    else:
      logging.warning(f"URL: {web_bridge_url}, Response_Status: {response.status_code}")
      if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid username/password provided")
      elif response.status_code == 400:
        raise HTTPException(status_code=400, detail="Invalid Space GUID Provided")
      elif response.status_code == 307:
        return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
      elif response.status_code == 200:
        return response.json()


@router.post("/getMeetingInformation/")
async def getMeetingInformation(getMeetingEmailInvitationInput: getMeetingEmailInvitationInput):

    web_bridge_url = f"https://{getMeetingEmailInvitationInput.webBridgeURL}/api/cospaces/{getMeetingEmailInvitationInput.spaceGUID}/accessMethods/{getMeetingEmailInvitationInput.accessMethodGUID}/emailInvitation"

    payload = json.dumps({"language": "en_GB"})

    headers = {'Authorization': f'Bearer {getMeetingEmailInvitationInput.authToken}'}

    try:
      response = requests.request("POST", web_bridge_url, headers=headers,data=payload, verify=False)

    except ConnectionError:
      raise HTTPException(status_code=400, detail="Invalid web bridge URL provided")
    except Exception as getMeetingLinkExc:
      print (f"Exception occured while getting meeting Link: {getMeetingLinkExc}")
    else:
      logging.warning(f"URL: {web_bridge_url}, Response_Status: {response.status_code}")
      if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid username/password provided")
      elif response.status_code == 503:
        raise HTTPException(status_code=503, detail="Retry after 1 min")
      elif response.status_code == 400:
        raise HTTPException(status_code=400, detail="Invalid Space GUID or Access Method GUID Provided")
      elif response.status_code == 307:
        return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
      elif response.status_code == 200:
        return response.json()

@router.post("/validate")
async def getUserInfo(userData: userInfoPayload):

    web_bridge_url = f"https://{userData.webBridgeURL}/api/userLookup?query={userData.username}"

    headers = {'Authorization': f'Bearer {userData.authToken}'}
    try:
      response = requests.request("GET", web_bridge_url, headers=headers, verify=False)

    except ConnectionError:
      raise HTTPException(status_code=400, detail="Invalid web bridge URL provided")
    except Exception as validationEx:
      print (f"Exception occured while validating Auth token: {validationEx}")
    else:
      logging.warning(f"URL: {web_bridge_url}, Response_Status: {response.status_code}")
      if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid username/password provided")
      elif response.status_code == 307:
        return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
      elif response.status_code == 200:
        return response.json()


@router.post("/createSpace")
async def getUserInfo(userData: createSpaceInputs):

    web_bridge_url = f"https://{userData.webBridgeURL}/api/cospaces"


    headers = {'Authorization': f'Bearer {userData.authToken}'}

    payload =  json.dumps({"coSpaceTemplateId": createSpaceInputs.templateid, "name":createSpaceInputs.spacename })

    try:
      response = requests.request("POST", web_bridge_url, headers=headers, data=payload, verify=False)

    except ConnectionError:
      raise HTTPException(status_code=400, detail="Invalid web bridge URL provided")
    except Exception as validationEx:
      print (f"Exception occured while validating Auth token: {validationEx}")
    else:
      logging.warning(f"URL: {web_bridge_url}, Response_Status: {response.status_code}")
      if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid username/password provided")
      elif response.status_code == 307:
        return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
      elif response.status_code == 200:
        return response.json()

@router.post("/getSpaceTemplates")
async def getUserInfo(userData: getSpacesInput):

    web_bridge_url = f"https://{userData.webBridgeURL}/api/coSpaceTemplates"

    headers = {'Authorization': f'Bearer {userData.authToken}'}
    try:
      response = requests.request("GET", web_bridge_url, headers=headers, verify=False)

    except ConnectionError:
      raise HTTPException(status_code=400, detail="Invalid web bridge URL provided")
    except Exception as validationEx:
      print (f"Exception occured while validating Auth token: {validationEx}")
    else:
      logging.warning(f"URL: {web_bridge_url}, Response_Status: {response.status_code}")
      if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid username/password provided")
      elif response.status_code == 307:
        return HTTPException(status_code=307, detail="Temporary Redirection, please try after some time")
      elif response.status_code == 200:
        return response.json()