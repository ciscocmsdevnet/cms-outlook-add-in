import os
import json

## DB Parameters (Do not modify until necessary)
REDIS_USER='default'
REDIS_PASS='outlookaddinDB'
REDIS_HOST="localhost"
REDIS_PORT="6379"

## App URL Configurations
URL_PREFIX = "/addin/v1"

meetingLink =  None
## Reading inputs for CMS WEB ADMIN
try:
  # Allow CORS from these origins
  origins=[]

  allowedDomains =  [os.environ.get("ALLOWED_DOMAINS")]
  allowedDomains.append('localhost')
  allowedDomains.append('127.0.0.1')
  for hostname in allowedDomains:
    origins.append(f"https://{hostname}")
    origins.append(f"https://{hostname}:9443")
    origins.append(f"https://{hostname}:4200")

  WEB_ADMIN=os.environ.get("WEB_ADMIN")
  WEB_ADMIN_USERNAME=os.environ.get("WEB_ADMIN_USERNAME")
  WEB_ADMIN_PASSWORD=os.environ.get("WEB_ADMIN_PASSWORD")
  WEB_BRIDGES_OPTIONS=json.loads(os.environ['WEB_BRIDGES_OPTIONS'])
  SPACE_TEMPLATE=os.environ.get("SPACE_TEMPLATE")
  JID_ATTRIBUTE=os.environ.get("JID_ATTRIBUTE")
  PROVISIONED_COSPACES=bool(int(os.environ.get("PROVISIONED_COSPACES")))
  CALL_ID_PREFIX=os.environ.get("CALL_ID_PREFIX")
  INSTANT_MEETING_WEB_BRIDGE=os.environ.get("INSTANT_MEETING_WEB_BRIDGE")

except Exception as envException:
  print(f"Not able to read environment variables: {envException}")
  #print (json.loads(os.environ['WEB_BRIDGES_OPTIONS']))
  exit()