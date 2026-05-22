# Copyright 2021 Google LLC
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#      http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Use the official lightweight Node.js image.
# https://hub.docker.com/_/node
# FROM node:22-slim

# # Create and change to the app directory.
# WORKDIR /usr/src/app

# # Copy application dependency manifests to the container image.
# # A wildcard is used to ensure both package.json AND package-lock.json are copied.
# # Copying this separately prevents re-running npm install on every code change.
# COPY package*.json ./
# COPY tsconfig.json ./

# RUN apt-get update && apt-get install -y openssl

# # Install al because of typescript
# RUN npm ci

# COPY prisma ./prisma/

# RUN npx prisma generate
# # Copy local code to the container image.
# COPY . ./

# # Run Typescript build
# RUN npm run build

# # Luego borrar
# EXPOSE 5000

# # Run the web service on container startup.
# ## ENTRYPOINT [ "node", "server.js" ] from google Todo: analyze - This was previously commented
# CMD ["sh", "-c", "npm run db:deploy && npm run start:prod"]

# Stage 1: Build
FROM node:22-slim AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci  

COPY prisma ./prisma/
RUN npx prisma generate

COPY . ./
RUN npm run build 
# This stage is discarted after build

# Stage 2: Producción (la imagen final)
FROM node:22-slim
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y openssl

COPY package*.json ./
RUN npm ci --only=production 

COPY prisma ./prisma/
RUN npx prisma generate

COPY --from=builder /usr/src/app/dist ./dist 

RUN chown -R node:node /usr/src/app
USER node

CMD ["npm", "run", "start:prod"]