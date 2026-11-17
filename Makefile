.DEFAULT_GOAL := help
SHELL := /bin/bash

NPM ?= npm

.PHONY: help setup dev build preview test offline verify clean

help: ## Show the available tasks
	@cat scripts/banner.txt
	@awk 'BEGIN { FS = ":.*##" } /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-8s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo

setup: ## Install the dependencies
	$(NPM) install

dev: ## Start the dev server with hot reload
	$(NPM) run dev

build: ## Build the single-file app into dist/
	$(NPM) run build

preview: ## Serve the built app on a local URL
	$(NPM) run preview

test: ## Run the unit and boot tests once
	$(NPM) run test

offline: ## Scan the sources and the bundle for network calls
	$(NPM) run check:offline

verify: ## Test, build, then run the offline scan
	$(NPM) run verify

clean: ## Move build output and coverage to .trash/
	./scripts/clean.sh
