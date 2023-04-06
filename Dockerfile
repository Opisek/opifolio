# syntax=docker/dockerfile:1

# build frontend
FROM node:19-alpine AS frontend
WORKDIR /app
COPY src/frontend .

RUN apk add chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN addgroup -S puppeteer && adduser -S -G puppeteer puppeteer && mkdir -p /home/runner/Downloads /app && chown -R puppeteer:puppeteer /home/puppeteer && chown -R puppeteer:puppeteer /app
USER puppeteer
CMD [ "google-chrome-stable" ]

RUN npm install
RUN npm run build

# build backend
FROM golang:1.20-alpine AS backend
WORKDIR /app
COPY src/backend .
RUN go mod download
RUN go build -o dist/server
COPY config dist/config

# run
FROM alpine:3.17 AS runtime
WORKDIR /app
COPY --from=frontend /app/dist public
COPY --from=backend /app/dist .
ENTRYPOINT [ "/app/server" ]