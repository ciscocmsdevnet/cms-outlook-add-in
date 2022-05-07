import requests
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import logging
from requests.exceptions import ConnectionError
from fastapi.middleware.cors import CORSMiddleware
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class loginPayload(BaseModel):
    webBridgeURL: str
    username: str
    password: str

class getSpacesInput(BaseModel):
  webBridgeURL: str
  authToken: str

class getSpaceAccessMethodInput(getSpacesInput):
  spaceGUID: str

class getMeetingEmailInvitationInput(getSpaceAccessMethodInput):
    accessMethodGUID: str

class userInfoPayload(getSpacesInput):
    username: str

app = FastAPI()

# Allow CORS from these origins
origins = [
    "https://localhost:9443",
    "https://127.0.0.1:9443",
    "https://localhost",
    "https://127.0.0.1",
    "https://localhost:4200",
    "https://<Hostname>",
    "https://<Hostname>:9443",
    "https://<Hostname>:4200",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.post("/login/")
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


@app.post("/getUserSpaces/")
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

@app.post("/getSpaceAccessMethods/")
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


@app.post("/getMeetingInformation/")
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

@app.post("/validate")
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
      
      
@app.get("/getPredefinedSites/")
async def getPredefinedSites():
  return ["site1.abc.com", "site2.abc.com","site3.abc.com","site4.abc.com","site5.abc.com"]
      
      
      