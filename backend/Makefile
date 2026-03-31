.PHONY: help dev dev-infra dev-services build test lint format typecheck \
       deploy-staging deploy-prod db-migrate db-seed \
       docker-build docker-push clean logs

# ---------------------------------------------------------------------------
# Variables
# ---------------------------------------------------------------------------
SHELL := /bin/bash
COMPOSE := docker compose
SERVICES := api-gateway auth-service user-service role-service \
            tenant-service industry-service website-service template-service \
            theme-service ai-service ai-version-service product-service \
            inventory-service pricing-service order-service payment-service \
            refund-service wallet-service plugin-service domain-service \
            email-service pos-service analytics-service reporting-service \
            notification-service media-service config-service audit-service
AWS_REGION ?= us-east-1
AWS_ACCOUNT_ID ?= $(shell aws sts get-caller-identity --query Account --output text 2>/dev/null)
ECR_REGISTRY ?= $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com
IMAGE_TAG ?= $(shell git rev-parse --short HEAD)
HELM_CHART := infrastructure/helm/siteforge
NAMESPACE_STAGING := siteforge-staging
NAMESPACE_PROD := siteforge-prod

# ---------------------------------------------------------------------------
# Help
# ---------------------------------------------------------------------------
help: ## Show this help message
	@echo "SiteForge AI - Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ---------------------------------------------------------------------------
# Development
# ---------------------------------------------------------------------------
dev: dev-infra dev-services ## Start full local development environment

dev-infra: ## Start infrastructure services only (postgres, redis, kafka, minio)
	$(COMPOSE) up -d \
		postgres-identity postgres-core postgres-website postgres-ai \
		postgres-commerce postgres-orders postgres-platform postgres-insights postgres-system \
		redis zookeeper kafka minio
	@echo "Waiting for infrastructure to be healthy..."
	@$(COMPOSE) exec -T redis redis-cli ping > /dev/null 2>&1 || sleep 5
	@echo "Infrastructure is ready."

dev-services: ## Start all microservices
	$(COMPOSE) up -d $(SERVICES)

dev-stop: ## Stop all services
	$(COMPOSE) down

dev-clean: ## Stop all services and remove volumes
	$(COMPOSE) down -v --remove-orphans

dev-restart: ## Restart all services
	$(COMPOSE) restart $(SERVICES)

logs: ## Tail logs from all services (use SERVICE=name to filter)
ifdef SERVICE
	$(COMPOSE) logs -f $(SERVICE)
else
	$(COMPOSE) logs -f --tail=100
endif

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
build: ## Build all services locally
	pnpm install --frozen-lockfile
	pnpm build

build-service: ## Build a single service (use SERVICE=name)
	@if [ -z "$(SERVICE)" ]; then echo "Usage: make build-service SERVICE=auth-service"; exit 1; fi
	pnpm --filter $(SERVICE) build

# ---------------------------------------------------------------------------
# Test
# ---------------------------------------------------------------------------
test: ## Run all tests
	pnpm test

test-unit: ## Run unit tests only
	pnpm test:unit

test-integration: ## Run integration tests
	pnpm test:integration

test-e2e: ## Run end-to-end tests
	pnpm test:e2e

test-service: ## Run tests for a single service (use SERVICE=name)
	@if [ -z "$(SERVICE)" ]; then echo "Usage: make test-service SERVICE=auth-service"; exit 1; fi
	pnpm --filter $(SERVICE) test

test-coverage: ## Run tests with coverage report
	pnpm test:coverage

# ---------------------------------------------------------------------------
# Code Quality
# ---------------------------------------------------------------------------
lint: ## Run ESLint across all services
	pnpm lint

lint-fix: ## Run ESLint with auto-fix
	pnpm lint:fix

format: ## Format code with Prettier
	pnpm format

format-check: ## Check code formatting
	pnpm format:check

typecheck: ## Run TypeScript type checking
	pnpm typecheck

# ---------------------------------------------------------------------------
# Docker
# ---------------------------------------------------------------------------
docker-build: ## Build Docker images for all services
	@for service in $(SERVICES); do \
		echo "Building $$service..."; \
		docker build -t siteforge/$$service:$(IMAGE_TAG) \
			-t siteforge/$$service:latest \
			-f services/$$service/Dockerfile . ; \
	done

docker-build-service: ## Build Docker image for a single service (use SERVICE=name)
	@if [ -z "$(SERVICE)" ]; then echo "Usage: make docker-build-service SERVICE=auth-service"; exit 1; fi
	docker build -t siteforge/$(SERVICE):$(IMAGE_TAG) \
		-t siteforge/$(SERVICE):latest \
		-f services/$(SERVICE)/Dockerfile .

docker-push: ## Push all images to ECR
	aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(ECR_REGISTRY)
	@for service in $(SERVICES); do \
		echo "Pushing $$service..."; \
		docker tag siteforge/$$service:$(IMAGE_TAG) $(ECR_REGISTRY)/siteforge/$$service:$(IMAGE_TAG); \
		docker tag siteforge/$$service:latest $(ECR_REGISTRY)/siteforge/$$service:latest; \
		docker push $(ECR_REGISTRY)/siteforge/$$service:$(IMAGE_TAG); \
		docker push $(ECR_REGISTRY)/siteforge/$$service:latest; \
	done

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
db-migrate: ## Run database migrations for all services
	@for service in $(SERVICES); do \
		if [ -d "services/$$service/prisma" ]; then \
			echo "Migrating $$service..."; \
			pnpm --filter $$service prisma:migrate; \
		fi \
	done

db-migrate-service: ## Run migrations for a single service (use SERVICE=name)
	@if [ -z "$(SERVICE)" ]; then echo "Usage: make db-migrate-service SERVICE=auth-service"; exit 1; fi
	pnpm --filter $(SERVICE) prisma:migrate

db-seed: ## Seed databases for all services
	@for service in $(SERVICES); do \
		if [ -d "services/$$service/prisma" ] && [ -f "services/$$service/prisma/seed.ts" ]; then \
			echo "Seeding $$service..."; \
			pnpm --filter $$service prisma:seed; \
		fi \
	done

db-generate: ## Generate Prisma clients
	@for service in $(SERVICES); do \
		if [ -d "services/$$service/prisma" ]; then \
			echo "Generating Prisma client for $$service..."; \
			pnpm --filter $$service prisma:generate; \
		fi \
	done

db-reset: ## Reset all databases (WARNING: destroys data)
	@echo "WARNING: This will destroy all data. Press Ctrl+C to cancel."
	@sleep 3
	@for service in $(SERVICES); do \
		if [ -d "services/$$service/prisma" ]; then \
			echo "Resetting $$service database..."; \
			pnpm --filter $$service prisma:reset -- --force; \
		fi \
	done

# ---------------------------------------------------------------------------
# Deployment
# ---------------------------------------------------------------------------
deploy-staging: docker-build docker-push ## Build, push, and deploy to staging
	helm upgrade --install siteforge $(HELM_CHART) \
		--namespace $(NAMESPACE_STAGING) \
		--create-namespace \
		--set global.imageRegistry=$(ECR_REGISTRY) \
		--set image.tag=$(IMAGE_TAG) \
		--set global.environment=staging \
		--values $(HELM_CHART)/values.yaml \
		--values $(HELM_CHART)/values-staging.yaml \
		--wait \
		--timeout 10m
	@echo "Staging deployment complete."

deploy-prod: ## Deploy to production (requires pre-built images)
	@echo "Deploying to PRODUCTION with image tag: $(IMAGE_TAG)"
	@echo "Press Ctrl+C within 5 seconds to cancel..."
	@sleep 5
	helm upgrade --install siteforge $(HELM_CHART) \
		--namespace $(NAMESPACE_PROD) \
		--create-namespace \
		--set global.imageRegistry=$(ECR_REGISTRY) \
		--set image.tag=$(IMAGE_TAG) \
		--set global.environment=production \
		--values $(HELM_CHART)/values.yaml \
		--values $(HELM_CHART)/values-production.yaml \
		--wait \
		--timeout 15m
	@echo "Production deployment complete."

deploy-rollback-staging: ## Rollback staging deployment
	helm rollback siteforge --namespace $(NAMESPACE_STAGING)

deploy-rollback-prod: ## Rollback production deployment
	helm rollback siteforge --namespace $(NAMESPACE_PROD)

# ---------------------------------------------------------------------------
# Infrastructure (Terraform)
# ---------------------------------------------------------------------------
tf-init: ## Initialize Terraform
	cd infrastructure/terraform && terraform init

tf-plan: ## Plan Terraform changes
	cd infrastructure/terraform && terraform plan -out=tfplan

tf-apply: ## Apply Terraform changes
	cd infrastructure/terraform && terraform apply tfplan

tf-destroy: ## Destroy Terraform resources (DANGER)
	@echo "WARNING: This will destroy ALL infrastructure. Press Ctrl+C to cancel."
	@sleep 10
	cd infrastructure/terraform && terraform destroy

# ---------------------------------------------------------------------------
# Utilities
# ---------------------------------------------------------------------------
clean: ## Remove build artifacts, node_modules, and dist
	find . -name "node_modules" -type d -prune -exec rm -rf {} +
	find . -name "dist" -type d -prune -exec rm -rf {} +
	find . -name "coverage" -type d -prune -exec rm -rf {} +
	find . -name ".turbo" -type d -prune -exec rm -rf {} +

install: ## Install all dependencies
	pnpm install --frozen-lockfile

update-deps: ## Update dependencies interactively
	pnpm update --interactive --latest

health-check: ## Check health of all running services
	@for service in $(SERVICES); do \
		PORT=$$($(COMPOSE) port $$service $$(echo $$service | sed 's/.*//') 2>/dev/null | cut -d: -f2); \
		if [ -n "$$PORT" ]; then \
			STATUS=$$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$$PORT/health 2>/dev/null); \
			echo "$$service: $$STATUS"; \
		else \
			echo "$$service: not running"; \
		fi \
	done
