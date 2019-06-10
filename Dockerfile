FROM node:8

# Create app directory
WORKDIR /usr/src/ldd-transform

# Bundle app source
COPY public public
COPY lddtool-web-service lddtool-web-service
COPY index.js package*.json *.xsl README.md ./

# Install app dependencies
RUN npm install --production --quiet

EXPOSE 3001

CMD [ "npm", "start" ]