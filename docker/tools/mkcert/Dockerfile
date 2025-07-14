FROM golang:1.22-alpine AS build
WORKDIR /src
RUN go install filippo.io/mkcert@latest

FROM alpine:3.20
COPY --from=build /go/bin/mkcert /usr/local/bin/
ENTRYPOINT ["/usr/local/bin/mkcert"]