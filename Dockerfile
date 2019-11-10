FROM node:8.10.0-alpine

# Set a working directory
WORKDIR /usr/src/app

COPY ./build/package.json .
COPY ./build/yarn.lock .

# Install curl
RUN apk --no-cache add curl mysql

# Install Node.js dependencies
RUN yarn install --production --no-progress

# Copy application files
COPY ./build .

# Run the container under "node" user by default
USER node

CMD [ "node", "server.js" ]
