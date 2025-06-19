dev:
	docker compose -f ./docker/docker-compose.dev.yml up --remove-orphans || make dev-down
dev-down:
	docker compose -f ./docker/docker-compose.dev.yml down --remove-orphans
prod:
	docker compose -f ./docker/docker-compose.prod.yml up --build -V --remove-orphans
prod-down:
	docker compose -f ./docker/docker-compose.prod.yml down --remove-orphans
clean:
	find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
	find . -name "dist" -type d -prune -exec rm -rf '{}' +
	find . -name "build" -type d -prune -exec rm -rf '{}' +
	docker compose -f ./docker/docker-compose.dev.yml rm -v -f || true
