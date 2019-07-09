FROM node:8.13.0-alpine as builder

RUN apk --update add python \
  build-base

WORKDIR /src/be

COPY package.json package-lock.json  ./

RUN npm install

COPY tsconfig.json ./

COPY /migrations ./migrations

COPY /src ./src/

RUN npm run build

FROM node:8.13.0-alpine

WORKDIR /src/be

COPY --from=builder /src/be/ ./

CMD [ "node", "./dist/app.js" ]


