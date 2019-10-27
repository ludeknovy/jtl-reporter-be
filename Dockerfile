FROM node:8.13.0-alpine as builder

RUN apk --update add python git \
  build-base

WORKDIR /src/be

COPY package.json package-lock.json  ./

RUN npm install

COPY tsconfig.json custom-typings.d.ts openapi.json ./

COPY /migrations ./migrations

COPY /src ./src/
 

RUN npm run build

FROM node:8.13.0-alpine

WORKDIR /src/be

COPY --from=builder /src/be/ ./

CMD [ "npm", "run", "start" ]


