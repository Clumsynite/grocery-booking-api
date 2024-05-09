## BUILD APP
FROM node:21 as build-stage

WORKDIR /usr/src/app

RUN npm install -g typescript
RUN npm install -g ts-node

COPY package*.json ./
COPY .env ./

RUN npm install

COPY . .

RUN npm run build

## RUN IN PRODUCTION
FROM node:21 as prod-stage

WORKDIR /usr/src/app

COPY package*.json ./
COPY .env ./

RUN npm install --omit=dev

COPY --from=build-stage /usr/src/app/dist ./dist

EXPOSE 5000

CMD [ "npm", "start" ]
