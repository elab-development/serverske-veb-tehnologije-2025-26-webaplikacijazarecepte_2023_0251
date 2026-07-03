# STeh Recepti - Recipe Search Web Application

Faculty seminar project focused on backend services of a web application.

## Current State

- This repository now contains project documentation, `docker-compose.yml`, and the full STeh Recepti backend/frontend source folders.
- Docker service definitions and build contexts are set for a 3-service architecture: MongoDB, backend, frontend.

## Project Goal

Implement a recipe web app and produce a document containing:

- user/business requirement,
- used technologies,
- usage scenarios,
- representative code,
- complete Docker and Docker Compose process,
- evidence through terminal commands and screenshots.

## Architecture

- Frontend: Angular
- Backend: Node.js + Express
- Database: MongoDB
- Orchestration: Docker Compose

## Docker Configuration Summary

From the current `docker-compose.yml`:

- `mongodb` service:
  - image: `mongo:4.4`
  - container: `steh-recepti-mongodb`
  - port mapping: `${MONGO_PORT}:27017`
  - volume: `mongodb_data:/data/db`
- `backend` service:
  - build context: `./backend`
  - container: `steh-recepti-backend`
  - port mapping: `${BACKEND_EXTERNAL_PORT}:${BACKEND_PORT}`
  - bind mount: `./backend/src:/usr/src/app/src`
- `frontend` service:
  - build context: `./frontend`
  - container: `steh-recepti-frontend`
  - port mapping: `${FRONTEND_PORT}:${FRONTEND_PORT}`
- network: `steh-recepti-network` (bridge)
- named volume: `steh-recepti-mongodb-data`

## Environment Variables

Current `.env` contains:

- MongoDB credentials and database name
- backend internal/external ports
- Mongo connection URI
- CORS origin
- JWT secret
- frontend port and API URL
- compose project name

## Starting the Application

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose installed
- Ports `8080`, `3001` and `27017` must be free (check with `netstat -ano | findstr :8080` on Windows or `lsof -i :8080` on Linux/Mac)

### Start

```bash
# Build and start all services in the background
docker compose up -d --build
```

The first run takes longer because Docker pulls `mongo:4.4`, `node:20-slim` and `nginx:alpine` images and installs npm packages for frontend and backend.

### Verify Everything is Running

```bash
# Check container status - all should be "Up"
docker compose ps

# Check backend health endpoint
curl http://localhost:3001/health
# Expected response: {"status":"ok","message":"Backend API is running"}

# Check frontend (returns HTML)
curl -I http://localhost:8080
# Expected response: HTTP/1.1 200 OK (+ html)
```

The application is available at:

- **Frontend:** [http://localhost:8080](http://localhost:8080)
- **Backend API:** [http://localhost:3001](http://localhost:3001)

### Stop

```bash
# Stop all containers but keep volumes (database data preserved)
docker compose down

# Stop all containers AND REMOVE volumes (empty database on next start)
docker compose down -v
```

### Common Startup Errors

| Error | Cause | Solution |
|---|---|---|
| `port is already allocated` | Port is already in use (e.g. MongoDB on 27017 or NGINX on 8080) | Stop the service using that port or change the port in the `.env` file |
| `EADDRINUSE` in backend logs | Another process is listening on `${BACKEND_PORT}` (3001) | `netstat -ano | findstr :3001` and `taskkill /PID <PID> /F` (Windows) or `kill <PID>` (Linux/Mac) |
| `connect ECONNREFUSED` on API calls | Backend cannot connect to MongoDB | Check if the `mongodb` service has `Up` status in `docker compose ps`; wait 30s for MongoDB to initialize |
| `Module not found` or `Cannot find module` | Build cache was not refreshed after adding new packages | Run `docker compose build --no-cache` then `docker compose up -d` |
| Frontend shows a blank page | Angular build failed or NGINX is misconfigured | Check `docker compose logs frontend` for build errors |
| `MongoNetworkError` | MongoDB container is not ready when backend attempts to connect | Backend has `depends_on` but MongoDB needs time; restart backend: `docker compose restart backend` |
| Angular `import error` in console | Angular package versions are incompatible | Check `frontend/package.json` - all Angular versions must match (~19.2.x); delete `node_modules` and `package-lock.json` then rebuild |

## Docker - Reference Table

| Requirement | Status | Evidence |
|---|---|---|
| Docker compose with frontend/backend/database services | Done | `docker-compose.yml` |
| Dockerfiles for all services | Done | `backend/Dockerfile`, `frontend/Dockerfile` |
| Network definition | Done | `steh-recepti-network` |
| Volume definition + bind mount | Done | `mongodb_data`, `./backend/src:/usr/src/app/src` |
| Separate env file usage | Done | `.env` + `env_file` |
| Terminal-based process evidence (images/containers/networks/volumes) | Done | `docker compose build`, `docker compose up -d`, `docker compose ps`, `docker images`, `docker volume ls`, `docker network ls` |
| Application running proof | Done | `curl -I http://localhost:8080`, `curl http://localhost:3001/health` |
| Higher-grade Docker options explanation | In progress | Final documentation pass |
