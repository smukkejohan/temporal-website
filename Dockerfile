# This official base image contains node.js and npm
FROM node:11.0-alpine

#ARG VERSION=1.0.0

# Install git (alpine)
RUN apk add --no-cache git && \
   rm -rf /tmp/* /var/cache/apk/*

RUN adduser -D appuser

WORKDIR /usr/src/app

RUN chown -R appuser:appuser ./

USER appuser

# Install app dependencies
COPY --chown=appuser package.json ./
COPY --chown=appuser yarn.lock ./
RUN yarn install

# Bundle app source
COPY --chown=appuser . .

RUN yarn build

FROM nginx:alpine
COPY --from=0 /usr/src/app/dist /usr/share/nginx/html
