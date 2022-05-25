# Docker compose health check

This action checks if the docker compose services are running. As of the latest version, the check is only if TCP sockets are listening.

# Usage

To add this action to a workflow:
```yaml
      - name: docker compose health check
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
# Labels

All labels must have the prefix `dchc.port.X` where `X` is the port number. See the [example below](#labeling-docker-compose-examples).

| Label      | Default  | Description |
| :--------: | :------: | ----------- |
| `enabled`  | `true`   | Enables or disables check for that port. |
| `timeout`  | `1`      | The timeout for the TCP connection in seconds. |
| `retries`  | `5`      | The number of retries. |
| `interval` | `1`      | Interval between retries in seconds. |

# Action example
```yaml
name: docker compose health check
on:
  push:

jobs:
  hc:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run docker compose up
        run: |
          docker-compose up -d
      - name: docker compose health check
      - uses: onvrb/docker-compose-health-check@main
```

# Labeling docker compose example
```yaml
version: "3.9"
services:
  mariadb:
    image: mariadb
    volumes:
      - ./mariadb:/var/lib/mysql
    # ports:                             # purposely commented
    #   - "3306:3306"                    # service check will be skipped because has no exposed ports
    labels:                              # even if you specify a label,
      - "dchc.port.3306.enabled=true"    # it will be ignored
  mongodb:
    image: mongo
    volumes:
      - ./mongodb:/data/db
    ports:
      - "27017:27017"
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
      - "dchc.port.8080.enabled=true"    # optional
      - "dchc.port.8080.timeout=1"       # optional
      - "dchc.port.8080.retries=10"      # overrides default retries to 10
      - "dchc.port.8080.interval=3"      # overrides default interval to 3s
      - "dchc.port.9090.enabled=false"   # disables check for port 9090
      - "dchc.port.9000.enabled=true"    # does nothing because 9000 is not an exposed port
    depends_on:
      - mariadb
      - mongodb
```

# Contributing

Code should be changed as Typescript in the `src` directory and "compiled" to Javascript like running `npm run format && npm run build && npm run package`.
