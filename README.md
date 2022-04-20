# Cisco Meeting Server Outlook Add-In

Cisco Meeting Server is an on-premies meeting server. This repository helps with following

- Setuping up a Middleware in your environment, acting like a proxy for Scheduling CMS meetings
- An outlook Add-in manifest file, which you can add to your Outlook client

## DISCLAIMER: 

THIS ADD-IN IS JUST FOR POC PURPOSES. PLEASE DO NOT USE ADD-IN WHEN YOUR CMS CLUSTER IS BUSY SERVING MEETINGS. DO NOT DEPLOY THIS MIDDLEWARE IN DMZ, AS WE HAVE NOT EVALUATED ANY SECURITY REQUIREMENT FOR THIS SOLUTION. 
PLEASE NOTE, NO TAC SUPPORT WILL BE PROVIDED FOR THIS POC. PLEASE REACH OUT TO sakhanej@cisco.com IF YOU INTEND TO DEPLOY IN CERTAIN RESTRICTED ENVIRONMENT.

DOCKER IMAGES PROVIDED IN THIS POC ARE  VERIFIED AGAINST  DOCKER-SCAN-PLUGIN AVAILABLE FROM DOCKER HUB. THESE ARE NOT CISCO APPROVED DOCKER IMAGES.
PLEASE DO NOT ATTEMPT TO TRY THIS ON ANY PRODUCTION SYSTEM, THIS POC IS JUST MEANT TO CAPTURE YOUR FEEDBACK AROUND THE SOLUTION

## Solution Highlights:

- This solution provides the capability to get meeting information directly into your outlook client.
- A middleware application is created which acts as a bridge between Outlook Client and your CMS Environment
- This middleware does not store any credentials, it just act as Request pass-through to Cisco Meeting Server web-bridge.
- The login session in this Add-in is valid for 24 hours, as a result user may need to login every 24 hour.


## Pre-requisites:
- A linux machine (2gb RAM, 2vCPU, 50GB hard disk), pick any OS (Ubuntu, CentOS). This guide follows commands relevant to Ubuntu System. If your using any other OS, the commands should be modified accordingly.
- Install docker service and openssl on this linux machine. Logout and Login after running these commands
```
sudo apt-get update && sudo apt-get install docker.io openssl
sudo usermod -aG docker $USER
```
- Internal CA Signed Certificate (Outlook Add-In only communicates via Https, hence we need certificate to be signed by CA, which your organisation trusts)
- A hostname for middleware service (required for add-in manifest file and certificate)
- Network reachability between Outlook clients to Middleware to CMS Infrastructure
- This Add-in PoC is only supported on following versions of Outlook:
  - Outlook 2013 or later on Windows
  - Outlook 2016 or later on Mac
  - Outlook on the web for Exchange 2016 or later
  - Outlook on the web for Exchange 2013
  - Outlook.com



## Middleware Usage

- Provides a mechanism to login to your CMS web app:
	- User needs to login via CMS web app credentials, so PMR licence is needed
	- If your CMS only supports SSO, then this Add-in will not work for you. We plan to add support for SSO in next release
- Provides an ability to see all your spaces and their respective access methods
	- Make sure you have spaces created, if not, login to web app and create some sample spaces for testing
- Provides an ability to get meeting information based on access method
- Note: You need to first `Save Preferences`, then select `Get meeting Link`



## Deployment Steps:

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
2. Update `auth.server.ts` file under `addInFrontent/src/app/services` with middleware hostname. Replace `<Hostname>` with your middleware hostname (as defined in Stage 1)
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
