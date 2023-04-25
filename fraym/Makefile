include .env

.PHONY: help
help: ## Show this help.
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"; printf "\Targets:\n"} /^[$$()% a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m	 %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

.PHONY: crud
crud: ## Migrate all CRUD types
	npx @fraym/crud@${CRUD_CLIENT_VERSION}

.PHONY: auth
auth: ## Migrate all Permissions
	npx @fraym/auth@${AUTH_CLIENT_VERSION}

.PHONY: projections
projections: ## Migrate all Projections
	npx @fraym/projections@${PROJECTIONS_CLIENT_VERSION}
