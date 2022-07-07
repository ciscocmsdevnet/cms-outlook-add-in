import json
from fastapi import APIRouter, Request, HTTPException
import logging as log
from fastapi.responses import JSONResponse
import config
from requests.auth import HTTPBasicAuth
import requests

log.basicConfig(level="INFO")


router = APIRouter(tags=["Admin API"])

def deleteSpaceFromCMS(spaceID):
  
  coSpaceDeleteURL = f"{config.WEB_ADMIN}/api/v1/coSpaces/{spaceID}"
  try:
    response = requests.request("DELETE", coSpaceDeleteURL,auth=HTTPBasicAuth(config.WEB_ADMIN_USERNAME, config.WEB_ADMIN_PASSWORD),verify=False)
  except ConnectionError:
    raise HTTPException(status_code=400, detail="Invalid URL provided")
  except Exception as getUserEx:
    log.error (f"Exception occured while filtering User: {getUserEx}")
    raise HTTPException(status_code=500, detail="Internal Error")
  else:
    log.info(f"METHOD: DELETE, URL: {coSpaceDeleteURL}, Response_Status: {response.status_code}")
  return response.status_code


@router.delete("/deleteInstantMeeting/")
async def deleteInstantMeetingSpace(request: Request,
                    username: str
                  ):
  ## Method will delete the Instant Meeting Space from DB and From CMS
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
      log.info(f"Record present in DB, proceeding with deletion..")
      try:
        deleteStatus = deleteSpaceFromCMS((json.loads(meetingInfo))['coSpaceID'])
      except Exception as ex:
        log.error(f"Error occured while deleting the Space from CMS: {ex}")
      else:
        ## Delete from DB
        if deleteStatus == 200:
          log.info(f"Deleting from DB..")
          try:
            request.app.redis_db = request.app.refresh_client()
          except Exception as dbException:
            log.error(f"Error connecting to Redis DB: {dbException}")
            pass
          else: ## Checking if record exist for this username
            request.app.redis_db.delete(jidMappedUserID)
          return JSONResponse(content=True, status_code=200)
        else:
          raise HTTPException(status_code=deleteStatus, detail="Cannot delete Space from CMS")
    else:
      raise HTTPException(status_code=404, detail="No meeting space present, cannot delete the same")
