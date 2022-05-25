# Docker compose health check

This action checks if the docker compose services are running. As of the latest version, the check is only if TCP sockets are listening.

# Usage

To add this action to a workflow:

```yaml
      - uses: onvrb/docker-compose-health-check@main
        with:
          docker-compose-file: docker-compose.yml     # optional, assumes docker-compose.yml
```

Accepts the exposed ports as docker compose accepts them:
```yaml
    ports:
      - 80
      - "81"
      - 82:83
      - "84:85"
```

It will perform the TCP check for all ports and services assuming these default labels for each exposed port (if not specified):
  ```yaml
    labels:
      - "dchc.port.80.enabled=true"  # enables check for port 80
      - "dchc.port.80.timeout=1"     # TCP connection timeout in seconds for port 80
      - "dchc.port.80.retries=5"     # how many retries for port 80
      - "dchc.port.80.interval=1"    # interval in seconds between retries for port 80
  ```

# Examples
  
```yaml
version: "3.9"
services:
  db:
    image: mongo
    ports:
      - "27017:27017"
    volumes:
      - ./db:/data/db
    labels:
      - "dchc.port.27017.enabled=true"   # optional
      - "dchc.port.27017.timeout=1"      # optional
      - "dchc.port.27017.retries=5"      # optional
      - "dchc.port.27017.interval=1"     # optional
  web:
    build: ./web
    volumes:
      - ./web:/app
    ports:
      - "8080:80"
      - "9090:9000"
    labels:
      - "dchc.port.8080.enabled=true"   # optional
      - "dchc.port.8080.timeout=1"      # optional
      - "dchc.port.8080.retries=10"     # overrides default retries to 10
      - "dchc.port.8080.interval=3"     # overrides default interval to 3s
      - "dchc.port.9090.enabled=false"  # disables check for port 9000
      - "dchc.port.9000.enabled=true"   # does nothing because 9000 is not an exposed port
    depends_on:
      - db
```

# Contributing

Code should be changed as Typescript in the `src` directory and "compiled" to Javascript like running `npm run format && npm run build && npm run package`.
