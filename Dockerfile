FROM node:20 AS development

WORKDIR /usr/src/app

COPY package*.json ./


RUN npm install

COPY . .

FROM node:20 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

RUN npm run build

CMD ["node", "dist/main"]