# Cisco Meeting Server Outlook Add-In

Cisco Meeting Server is an on-premies meeting server. This Add-In is created using CMS API's 👀, some Python 🐍 and some JavaScript 𝒥. We have released a new version, better than our PoC version, keeping simple deployments, easy of use in mind🧠 .

Feel free to provide us any feedbacks on `cmsdevelopers@cisco.com` ❤️

Let's dive 🐬 in...

- [Cisco Meeting Server Outlook Add-In](#cisco-meeting-server-outlook-add-in)
  - [Disclaimer:](#disclaimer)
  - [Solution Highlights:](#solution-highlights)
  - [Pre-requisites:](#pre-requisites)
    - [Middleware Setup](#middleware-setup)
    - [Add-In Support](#add-in-support)
    - [Add-In Config Parameters](#add-in-config-parameters)
  - [Deployment Steps](#deployment-steps)
  - [Known issues](#known-issues)
  - [Getting help](#getting-help)
  - [Getting involved](#getting-involved)
  - [Credits](#credits)
  - [1. Evgenii Fedotov (evfedoto@cisco.com)](#1-evgenii-fedotov-evfedotociscocom)
  

## Disclaimer: 

* PLEASE DO NOT USE ADD-IN WHEN YOUR CMS CLUSTER IS BUSY SERVING MEETINGS WHEN TESTING
* DO NOT DEPLOY THIS MIDDLEWARE IN DMZ, AS WE HAVE NOT EVALUATED ANY SECURITY REQUIREMENT FOR THIS SOLUTION. 
* NO CISCO TAC SUPPORT WILL BE PROVIDED FOR THIS ADD-IN. PLEASE REACH OUT TO `cmsdevelopers@cisco.com` IF YOU INTEND TO DEPLOY IN CERTAIN RESTRICTED ENVIRONMENT.
* DOCKER IMAGES CAN BE PROVIDED IF YOU HAVE AIRGAP NETWORK AND CANNOT CREATE IMAGES. PLEASE REACH OUT TO `cmsdevelopers@cisco.com`. THESE IMAGES WILL BE VERIFIED AGAINST  DOCKER-SCAN-PLUGIN AVAILABLE FROM DOCKER HUB. THEY WILL NOT BE CISCO APPROVED DOCKER IMAGES.
* PLEASE DO NOT ATTEMPT TO TRY THIS ON ANY PRODUCTION SYSTEM, UNTIL YOU HAVE DONE EXTENSIVE TESTING YOURSELF (_trust your testing_)
* YOU DO NOT NEED ANY ADDITIONAL LICENSES TO MAKE THIS ADD-IN WORK WITH CMS. WE USE CMS PMP AND SMP LICENSE FOR CREATING SPACES

## Solution Highlights:

> **From version 1 to version 2, we have add some flexibility and simplicity to deployments**
- This version provides:
  - Capability to get Meeting Information from existing CMS Space
  - Capability to create a new Space on-demand and get Meeting Information
  - Ability to get Instant Meeting without login into CMS Add-In
  
- A middleware application needs to be deployed which
  - Acts like a bridge between Outlook Client and your CMS Environment
  - It provides you with all logs for troubleshooting
  - It does not store any credentials
  - Store user meeting formation in Redis Cache DB, to save un-necessary API Requests to CMS.
  
- The login session in this Add-in is valid for 24 hours, as a result user may need to login every 24 hour.
- This Add-In is tested and works in completely air-gap network also.


## Pre-requisites:
- An Ubuntu machine with 2gb RAM, 2vCPU, 50GB hard disk.

### Middleware Setup
- **Install docker, docker-compose and openssl**. Logout and Login after running these commands
```sh
sudo apt-get update && sudo apt-get install docker.io openssl
sudo usermod -aG docker $USER

sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```
- **Internal CA Signed Certificate** (Outlook Add-In only communicates via Https, hence we need certificate to be signed by CA, which your organisation trusts)
- A **hostname** for the middleware (everybody needs a name 😝)
- Network reachability between Outlook clients to Middleware to CMS Infrastructure
  
### Add-In Support
- This Add-in is only supported on following versions of Outlook:
  - Outlook 2013 or later on Windows
  - Outlook 2016 or later on Mac
  - Outlook on the web for Exchange 2016 or later
  - Outlook on the web for Exchange 2013
  - Outlook.com

### Add-In Config Parameters
- In version 2, we have added some configs to increase the flexibility

> Modify `config.env` found in addInBackend Folder:
```env
WEB_ADMIN=<cms web admin URL>
WEB_ADMIN_USERNAME=<API username>
WEB_ADMIN_PASSWORD=<API password>
WEB_BRIDGES_OPTIONS=<List of web-bridges>
INSTANT_MEETING_WEB_BRIDGE=<web-bridge hostname for instant meeting>
SPACE_TEMPLATE=<space template, to be used when creating instant meeting>
CALL_ID_PREFIX=<call-id prefix for space created for instant meeting>
JID_ATTRIBUTE=<if outlook domain is different than CMS domain>
ALLOWED_DOMAINS=<middleware hostname>
PROVISIONED_COSPACES=<True, if user have provionsioned co-spaces>
INVITATION_LANG=<Language support for invitation>
```
> Sample `config.env` for reference:
```env
WEB_ADMIN=https://abc.cisco.com
WEB_ADMIN_USERNAME=admin
WEB_ADMIN_PASSWORD=admin
WEB_BRIDGES_OPTIONS=["web.cisco.com","10.48.90.99"]
INSTANT_MEETING_WEB_BRIDGE=web.cisco.com
SPACE_TEMPLATE=Provisioned Team Space
CALL_ID_PREFIX=423423
JID_ATTRIBUTE=None
ALLOWED_DOMAINS=middleware.cisco.com
PROVISIONED_COSPACES=0
INVITATION_LANG=en_GB
```

> Modify `config.env` found in addInFrontend Folder:
```
BACKEND_URL=https://<middleware hostname>/addin/v1
```
> Sample `config.env` for reference:
```
BACKEND_URL=https://middleware.cisco.com/addin/v1
```

## Deployment Steps

Stage 1: GENERATE CERTIFICATES

1. Get a hostname for your middleware service, eg: cmsscheduler.abc.com
2. Add DNS entry for this hostname in your DNS server or your system's  `/etc/host` file
3. Login to your linux machine and follow below steps:
   1. Clone this repository: `git clone https://github.com/ciscocmsdevnet/cms-outlook-add-in.git`
   2. Create a folder `certs` in this git repo: `mkdir certs`
   3. Generate certificate in this `certs` folder:
      1. Generate a CSR: `sudo openssl req -new -newkey rsa:2048 -nodes -keyout certificate.key -out certificate.csr`
      2. Specify necessary details required for the certificate (Country, State, hostname etc). Below snippet is just for reference [Snapshot 1]
      3. You would get key file and csr file in this `certs` folder: certificate.key and certificate.csr
      4. Get the CSR signed by you internal CA and copy it under same folder. 

**Note**: Make sure CA signed certificate ends with .cer extension. If incase you receive .crt certificate from your CA, refer this link on how to convert [(How can I convert a certificate file from .crt to .cer? | SonicWall)](https://www.sonicwall.com/support/knowledge-base/how-can-i-convert-a-certificate-file-from-crt-to-cer/170504597576961/)

![image](https://user-images.githubusercontent.com/40081345/164265718-abe7afa5-390a-4e57-93ec-62e7a538d7da.png)

Stage 2: DEPLOY MIDDLEWARE

**You can choose to create docker image from the code base directly or use the images provided in the code base**. Below steps cover on "How to use images provided in this code base"
1. Login to same linux server and go to repo folder
2. Create backend Image: `docker build -f ./addInBackend/Dockerfile -t addinfastapi ./addInBackend`
3. Create frontend Image: `docker build -f ./addInFrontend/Dockerfile -t cmsschedulerweb ./addInFrontend`
4. Lets run the service:
   1. docker run -d -p 9443:9443 --name addinfastapi --rm -v <certs directory path>:/certs/ addinfastapi
   2. docker run -d -p 443:443 --name cmsschedulerweb --rm -v <certs directory path>:/etc/nginx/certs/ cmsschedulerweb
		* You can run  `pwd` to get your certs directory path
	
Stage 3: MODIFY MANIFEST FILE/CORS FILES
	
1. Update manifest file with your middleware hostname. In the repository refer `manifest_reference.xml`. Replace `<Hostname>` with your middleware hostname (as defined in Stage 1)
2. Update `environment.ts`, `environment.prod.ts` files under `addInFrontent/src/environments` with middleware hostname. Set `backendurl` with your middleware hostname (as defined in Stage 1)
3. Update backend `main.py` origin list with middleware hostname.Replace `<Hostname>` with your middleware hostname (as defined in Stage 1)

Stage 4: Add Add-In to Outlook Clients
	
2. Add this Add-in using this manifest file in your outlook client. Refer this link on how to add Add-in through file.(https://docs.microsoft.com/en-us/office/dev/add-ins/outlook/sideload-outlook-add-ins-for-testing?tabs=windows)


## Known issues

- These docker images are not tested in a scaled deployment or stress tested to understand the performance
  
## Getting help

In case of any questions around Add-in, reach out to `sakhanej@cisco.com`

## Getting involved

Key areas we are currently focusing on:
  - trying to get feedback on features
  - fixing certain bugs.
  - Building for a use case to replace TMS scheduling capabilties

General instructions on _how_ to contribute should be stated with a link to [CONTRIBUTING](./CONTRIBUTING.md) file.

## Credits

1. Evgenii Fedotov (evfedoto@cisco.com)
----
