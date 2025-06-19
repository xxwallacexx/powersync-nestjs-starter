# PowerSync

PowerSync is a backend service built with [NestJS](https://nestjs.com/) for data synchronization, event processing, and API management. It is designed to run in a containerized environment with Docker and supports MongoDB as its primary storage and replication backend.

## Features

- **NestJS-based API server** with modular architecture
- **Data synchronization** using configurable rules
- **MongoDB** as storage and replication backend
- **JWT/JWKS authentication** support
- **Job queueing** with BullMQ and Redis
- **Dockerized deployment** for development and production

## Project Structure

```
powersync/
  docker/                # Docker and configuration files
  server/                # Main NestJS server application
    src/                 # Source code (controllers, services, etc.)
    test/                # Tests and mocks
  Makefile               # Common development commands
```

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/) (for local development, optional)
- [MongoDB](https://www.mongodb.com/) instance

### Configuration

Edit the configuration files in `docker/config/` as needed:

- `powersync.config.yaml`: Main service configuration (MongoDB URIs, ports, auth, etc.)
- `sync-rules.config.yaml`: Data sync rules

You need to provide a `.env` file for environment variables (see `docker/docker-compose.dev.yml` for required variables).

### Development

To start the development environment (including server, Redis, and PowerSync service):

```sh
make dev
```

To stop the development environment:

```sh
make dev-down
```

### Production

To start the production environment:

```sh
make prod
```

To stop the production environment:

```sh
make prod-down
```

### Local Development (without Docker)

1. Install dependencies:

   ```sh
   cd server
   npm ci
   ```

2. Start the server in development mode:

   ```sh
   npm run start:dev
   ```

3. Run tests:

   ```sh
   npm test
   ```

### Useful Commands

- `make clean`: Remove all build artifacts and containers
- `npm run lint`: Lint the codebase
- `npm run format`: Check code formatting
