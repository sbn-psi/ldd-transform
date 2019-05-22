FROM node:8

# Create app directory
WORKDIR /usr/src/ldd-transform

# Bundle app source
COPY public public
COPY ldd-tool-web-service ldd-tool-web-service
COPY index.js package*.json *.xsl README.md ./

# Install app dependencies
RUN npm install --only=production

EXPOSE 3001

CMD [ "npm", "start" ]