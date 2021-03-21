FROM node:14.16.0-alpine3.12 as builder

RUN apk --update add python git \
  build-base

WORKDIR /src/be

COPY package.json package-lock.json  ./

RUN npm install

COPY tsconfig.json custom-typings.d.ts openapi.json ./

COPY /migrations ./migrations

COPY /src ./src/

RUN npm run build

FROM node:14.16.0-alpine3.12

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.2/wait /wait
RUN chmod +x /wait

WORKDIR /src/be

COPY --from=builder /src/be/ ./

CMD [ "npm", "run", "start" ]
