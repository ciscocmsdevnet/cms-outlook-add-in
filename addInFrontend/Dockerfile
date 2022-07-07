### STAGE 1: Build ###
FROM node:18-alpine AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

### STAGE 2: Run ###
FROM nginx:1.21-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/cms-scheduler-outlookaddin-web /etc/nginx/html
EXPOSE 443
CMD ["/bin/sh",  "-c",  "envsubst < /etc/nginx/html/assets/env.template.js > /etc/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]
