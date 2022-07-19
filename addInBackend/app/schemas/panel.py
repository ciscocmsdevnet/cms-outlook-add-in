from pydantic import BaseModel

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

class createSpaceInputs(getSpacesInput):
    spacename: str
    templateid: str