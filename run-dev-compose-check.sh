#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="docker-compose.dev.yml"

printf "[0/5] Building services first (no downtime if build fails)...\n"
docker compose -f "$COMPOSE_FILE" build

printf "[1/5] Stopping and deleting previous compose resources...\n"
docker compose -f "$COMPOSE_FILE" down --remove-orphans || true

printf "[2/5] Starting services with built image...\n"
docker compose -f "$COMPOSE_FILE" up -d

printf "[3/5] Showing service status...\n"
docker compose -f "$COMPOSE_FILE" ps

printf "[4/5] Checking health endpoint...\n"
# Wait up to 30s for app startup to avoid false negatives right after container start.
for i in {1..30}; do
	if curl -fsS http://localhost:3000/health >/dev/null 2>&1; then
		curl -sS http://localhost:3000/health
		printf "\n"
		break
	fi
	if [[ "$i" -eq 30 ]]; then
		printf "Health check failed after %s attempts\n" "$i"
		exit 1
	fi
	sleep 1
done

printf "[5/5] Showing recent app logs...\n"
docker compose -f "$COMPOSE_FILE" logs --tail 50 app
