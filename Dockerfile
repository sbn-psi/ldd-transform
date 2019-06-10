FROM node:8
RUN apt-get update && apt-get install -y openjdk-8-jre

# Create app directory
WORKDIR /usr/src/ldd-transform

# Bundle app source
COPY public public
COPY ldd-tool-web-service ldd-tool-web-service
COPY index.js package*.json *.xsl README.md ./

# Install app dependencies
RUN npm install --production --quiet

EXPOSE 3001

CMD [ "npm", "start" ]