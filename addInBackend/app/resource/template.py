from cmath import log
from re import L
import config
import requests
from requests.auth import HTTPBasicAuth
import xmltodict
import logging
import json



def extractCoSpaceTemplateinfo(dbObject):

  spaceTemplateObject={}
  ## Check if coSpace Template is defined or not:
  if config.SPACE_TEMPLATE:
    ## Fetch Template details:
    try:
      spaceTemplateObject = dbObject.get(config.SPACE_TEMPLATE)
    except Exception as dbInsertExp:
      logging.error(f"Cannot Find Space Template Info in DB:{dbInsertExp}")
      pass
    else:
      if spaceTemplateObject: ## ie record exist
        logging.info(f"Record present in DB, fetched from there")
        return json.loads(spaceTemplateObject)


      ## Check for Provisioned coSpace
    spaceDetailURL=f"{config.WEB_ADMIN}/api/v1/coSpaceTemplates?filter={config.SPACE_TEMPLATE}"
    print (spaceDetailURL)
    try:
      response = requests.request("GET", spaceDetailURL, auth=HTTPBasicAuth(config.WEB_ADMIN_USERNAME, config.WEB_ADMIN_PASSWORD),verify=False)
    except ConnectionError:
      logging.error("Cannot extract coSpace Template information.. Connection Error to CMS")
      return False
    except Exception as getUserEx:
      logging.error(f"Cannot extract coSpace Template information.. Error Occured:{getUserEx}")
      return False
    else:
      logging.warning(f"URL: {spaceDetailURL}, Response_Status: {response.status_code}")
      if response.status_code == 401:
        logging.error(f"Cannot extract coSpace Template information.. Authorisation Failed..")
        return False
      elif response.status_code == 307:
        logging.error(f"Cannot extract coSpace Template information.. Too many redirects..")
        return False
      elif response.status_code == 200:
        json_response = json.loads(json.dumps(xmltodict.parse(response.content)))
        if int(json_response['coSpaceTemplates']['@total']) > 0:
          spaceTemplateObject = {
            'coSpaceTemplate': json_response['coSpaceTemplates']['coSpaceTemplate']
          }

        else:
          logging.error(f"Cannot find matching coSpaceTemplate..")
          return False
    
    ## get accessMethod details for this template
    if bool(spaceTemplateObject):
      spaceDetailAccessMethodURL=f"{config.WEB_ADMIN}/api/v1/coSpaceTemplates/{spaceTemplateObject['coSpaceTemplate']['@id']}/accessMethodTemplates"
      try:
        response = requests.request("GET", spaceDetailAccessMethodURL, auth=HTTPBasicAuth(config.WEB_ADMIN_USERNAME, config.WEB_ADMIN_PASSWORD),verify=False)
      except ConnectionError:
        logging.error("Cannot extract coSpace Template Access Method information.. Connection Error to CMS")
        return False
      except Exception as getUserEx:
        logging.error(f"Cannot extract coSpace Template Access Method information.. Error Occured:{getUserEx}")
        return False
      else:
        logging.warning(f"URL: {spaceDetailAccessMethodURL}, Response_Status: {response.status_code}")
        if response.status_code == 401:
          logging.error(f"Cannot extract coSpace Template Access Method information.. Authorisation Failed..")
          return False
        elif response.status_code == 307:
          logging.error(f"Cannot extract coSpace Template Access Method information.. Too many redirects..")
          return False
        elif response.status_code == 200:
          json_response = json.loads(json.dumps(xmltodict.parse(response.content)))
          if int(json_response['accessMethodTemplates']['@total']) > 0:
            spaceTemplateObject["accessMethod"] = json_response['accessMethodTemplates']['accessMethodTemplate']
          else:
            logging.error(f"Cannot find matching coSpace Access Method Template..")
            return False

    ## Store in DB
    try:
      dbObject.set(config.SPACE_TEMPLATE,json.dumps(spaceTemplateObject))
    except Exception as dbInsertExp:
      logging.error(f"Cannot Store Template Info in DB:{dbInsertExp}")
      pass
    return spaceTemplateObject

  else:
    logging.error("Space Template not defined, hence will not be used ")
    return False


