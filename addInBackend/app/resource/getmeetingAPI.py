import json
from fastapi import APIRouter, Request
import logging
from fastapi.responses import JSONResponse
from resource.instantMeeting import getUserMeetingInformation
import config

router = APIRouter()

@router.post("/getWebBridges/")
async def getWebBridgeUserLogin():
    try:
      payload = json.dumps({
      "webbridges": config.WEB_BRIDGES
    })
    except Exception as configException:
      logging.error(f"Error reading webbridges from config:{configException} ")
      payload = json.dumps({
      "webbridges": None
    })
    
    return JSONResponse(content=payload, status_code=200)


@router.post("/instantMeeting/{username}")
async def getInstantMeetingLink(request: Request,
                    username: str
                  ):

  ## Checking if any JID attribute is provided for user search on CMS
  if config.JID_ATTRIBUTE:
    jidMappedUserID = f"{username.split('@')[0]}.{config.JID_ATTRIBUTE}@{username.split('@')[1]}"
  else:
    jidMappedUserID = username
  ## Checking connectivity with DB
  try:
    request.app.redis_db = request.app.refresh_client()
  except Exception as dbException:
    logging.error(f"Error connecting to Redis DB: {dbException}")
    pass
  else: ## Checking if record exist for this username
    meetingInfo = request.app.redis_db.get(jidMappedUserID)
    
    if meetingInfo: ## ie record exist
      logging.info(f"Record present in DB, fetched from there")
      response = {
        "username": jidMappedUserID,
        "meetingInfo": json.loads(meetingInfo)
      }
      print ("fetched from DB")
      return JSONResponse(content=response, status_code=200)
    else:
      meetingInformation = getUserMeetingInformation(userjid=jidMappedUserID, dbObject=request.app.redis_db)
      print (meetingInformation)
      return meetingInformation
