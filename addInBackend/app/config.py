import os
import json

## DB Parameters (Do not modify until necessary)
REDIS_USER='default'
REDIS_PASS='outlookaddinDB'
REDIS_HOST="redis"
REDIS_PORT="6379"

## App URL Configurations
URL_PREFIX = "/addin/v1"

# sample = {
# "WEB_ADMIN": 'https://gmt-pacms1.cisco.com:445',
# "WEB_ADMIN_USERNAME": 'sakhanej',
# "WEB_ADMIN_PASSWORD": 'sakhanej',
# "WEB_BRIDGES": ['pajoin.cisco.com','abc.cisco.com'],
# "SPACE_TEMPLATE": 'Provisioned Team Space',
# "CALL_ID_PREFIX": '423423',
# "JID_ATTRIBUTE": None,
# "ALLOWED_DOMAINS": 'raitea.cisco.com&localhost&127.0.0.1',
# "PROVISIONED_COSPACES": 0
# }

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
  WEB_BRIDGES=json.loads(os.environ['WEB_BRIDGES'])
  SPACE_TEMPLATE=os.environ.get("SPACE_TEMPLATE")
  JID_ATTRIBUTE=os.environ.get("JID_ATTRIBUTE")
  PROVISIONED_COSPACES=os.environ.get("PROVISIONED_COSPACES")
  CALL_ID_PREFIX=os.environ.get("CALL_ID_PREFIX")

except Exception as envException:
  print(f"Not able to read environment variables: {envException}")
  #print (json.loads(os.environ['WEB_BRIDGES']))
  exit()