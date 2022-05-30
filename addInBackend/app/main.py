import redis
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

import uvicorn
from resource import panelAPI, getmeetingAPI, template
import config
import logging

app = FastAPI(
    title="CMS Outlook Add-In",
    description="CMS Outlook Add-In Backend Service Fast API",
    version="1.0.0",
    docs_url=f"{config.URL_PREFIX}/docs",
)

def configure(app):
    configure_routing(app)
    app.redis_db = configure_db()
    app.refresh_client = configure_db
    app.add_middleware(
              CORSMiddleware,
              allow_origins=config.origins,
              allow_credentials=True,
              allow_methods=["*"],
              allow_headers=["*"]
            )
    
    ## Making Sure connectivity to CMS and Whats used for Instant meetings
    if configure_templates(app.redis_db):
        logging.warning("Base Configuration Completed")
        return app
    else:
        exit()


def configure_routing(app):
    app.include_router(panelAPI.router, prefix=config.URL_PREFIX)
    app.include_router(getmeetingAPI.router, prefix=config.URL_PREFIX)
  


def configure_db():
    try:
        REDIS_URL = f"redis://{config.REDIS_USER}:{config.REDIS_PASS}@{config.REDIS_HOST}:{config.REDIS_PORT}"
        
        client = redis.StrictRedis.from_url(
            f"{REDIS_URL}/0", encoding="utf-8", decode_responses=True
        )

        ping = client.ping()
        logging.warning(f"DB PING: {ping}")

        if ping is True:
            return client
        logging.warning("Redis Cache Not Started")

    except redis.AuthenticationError:
        logging.warning("AuthenticationError: Redis Cache not started")

def configure_templates(dbconn):

    if config.PROVISIONED_COSPACES:
        logging.warning("Instant Meeting Set to pick user provisioned coSpaces")
    
    if config.SPACE_TEMPLATE:
        if template.extractCoSpaceTemplateinfo(dbconn):
            logging.warning ("Space Template and Access Methods Found.. Will be used to create spaces if provisioned coSpaces not present")
            return True
        else:
            return False
    else:
        return True

app = configure(app)

# if __name__ == "__main__":
#     logging.error("WHy")
#     uvicorn.run("main:app", host="0.0.0.0", port=9443, reload=True, worker=2)