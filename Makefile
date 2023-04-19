include .env.local

help: ## Print this help information
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"; printf "\nTargets:\n"} /^[$$()% a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m	 %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

docker: ## Get and install all dependency docker containers
	echo $(GH_ACCESS_TOKEN) | docker login ghcr.io -u hosting+github@becklyn.com --password-stdin

	docker pull ghcr.io/fraym/streams/streams:3.4.0
	docker pull ghcr.io/fraym/projections/projections:0.6.1
	docker pull ghcr.io/fraym/crud/crud:0.5.3
	docker pull ghcr.io/fraym/auth/auth:0.5.0
	docker pull ghcr.io/fraym/admin-ui/adminui:0.3.3

	docker logout ghcr.io

	docker compose up -d

docker-clean: ## Remove and cleanup all dependency containers and their data
	docker compose down -v
