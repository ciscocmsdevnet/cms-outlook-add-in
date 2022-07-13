import json
from fastapi import APIRouter, Request, HTTPException
import logging as log
from fastapi.responses import JSONResponse
from resource.instantMeeting import getUserMeetingInformation
import config

router = APIRouter(tags=["Admin API"])

log.basicConfig(level="INFO")

@router.post("/getWebBridges/")
async def getWebBridgeUserLogin():
    try:
      payload = json.dumps({
      "webbridges": config.WEB_BRIDGES_OPTIONS
    })
    except Exception as configException:
      log.error(f"Error reading webbridges from config:{configException} ")
      payload = json.dumps({
      "webbridges": None
    })
    
    return JSONResponse(content=payload, status_code=200)


@router.post("/instantMeeting/{username}")
async def getInstantMeetingLink(request: Request,
                    username: str
                  ):

  ## Checking if any JID attribute is provided for user search on CMS
  if config.JID_ATTRIBUTE and (config.JID_ATTRIBUTE != "None"):
    jidMappedUserID = f"{username.split('@')[0]}.{config.JID_ATTRIBUTE}@{username.split('@')[1]}"
  else:
    jidMappedUserID = username
  

  ## Checking connectivity with DB
  try:
    request.app.redis_db = request.app.refresh_client()
  except Exception as dbException:
    log.error(f"Error connecting to Redis DB: {dbException}")
    raise HTTPException(status_code=500, detail="Cannot connect to DB")
  else: ## Checking if record exist for this username
    meetingInfo = request.app.redis_db.get(jidMappedUserID)
    
    if meetingInfo: ## ie record exist
      log.info(f"Record present in DB, fetched from DB")
      meetingInfoJson = json.loads(meetingInfo)
      meetingInfoJson.pop('coSpaceID')
      return JSONResponse(content={"invitation":meetingInfoJson["subject"] + "\n\n\n" + meetingInfoJson["details"]}, status_code=200)
    else:
      meetingInformation = getUserMeetingInformation(userjid=jidMappedUserID, dbObject=request.app.redis_db)
      return meetingInformation
