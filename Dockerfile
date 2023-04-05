# syntax=docker/dockerfile:1

# build frontend
FROM node:19-alpine AS frontend
WORKDIR /app
COPY src/frontend .
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
FROM alpine:3.17
WORKDIR /app
COPY --from=frontend /app/dist public
COPY --from=backend /app/dist .
ENTRYPOINT [ "/app/server" ]