# ---
# Makefile - STeh Recepti project
#
# Requires: make, Docker
# On Windows: use make.bat as a thin wrapper, or install Make via:
#   winget install GnuWin32.Make
#   choco install make
# ---

.PHONY: help install dev build start test lint format clean         up down build-docker logs ps clean-all

help:
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "  Docker targets:"
	@echo "    up            Start all services (docker compose up -d)"
	@echo "    down          Stop all services (docker compose down)"
	@echo "    build-docker  Build all Docker images (docker compose build)"
	@echo "    logs          Tail all service logs (docker compose logs -f)"
	@echo "    ps            List running containers (docker compose ps)"
	@echo "    clean-all     Stop services, remove volumes + node_modules + dist"
	@echo ""
	@echo "  Frontend targets (run from project root, commands cd to frontend/):"
	@echo "    install       Install Angular dependencies"
	@echo "    dev           Run the Angular dev server"
	@echo "    build         Build the Angular app"
	@echo "    start         Run the Angular dev server"
	@echo "    test          Run unit tests"
	@echo "    lint          Lint TypeScript sources"
	@echo "    format        Format source and config files"
	@echo "    clean         Remove frontend/dist/, frontend/coverage/, and logs/"
	@echo ""

# -- Docker targets --------------------------------------------------------

up:
	docker compose up -d

down:
	docker compose down

build-docker:
	docker compose build

logs:
	docker compose logs -f

ps:
	docker compose ps

clean-all: down
	docker compose down -v
	rm -rf frontend/node_modules frontend/dist frontend/coverage
	rm -rf backend/node_modules

# -- Frontend targets (npm commands run inside frontend/) -------------------

install:
	cd frontend && npm install

dev:
	cd frontend && npm run start

build:
	cd frontend && npm run build

start:
	cd frontend && npm run start

test:
	cd frontend && npm run test

lint:
	cd frontend && npm run lint

format:
	cd frontend && npm run format

clean:
	@echo "Cleaning frontend/dist/, frontend/coverage/, and logs/..."
	@rm -rf frontend/dist/ frontend/coverage/
	@find logs/ -type f ! -name '.gitkeep' -delete 2>/dev/null || true
	@echo "Done."
