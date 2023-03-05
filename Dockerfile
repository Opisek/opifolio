# syntax=docker/dockerfile:1

FROM golang:1.16-alpine
WORKDIR /app
COPY src/ ./
RUN go mod download
RUN go build -o ./server
RUN rm ./go.mod
RUN rm ./server.go
CMD [ "/app/server" ]