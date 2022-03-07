BUILD_TAG ?= latest

build:
	docker build \
	-t impresso/impresso-frontend:${BUILD_TAG} \
	--build-arg GIT_TAG=${BUILD_TAG} \
	--build-arg GIT_BRANCH=$(shell git rev-parse --abbrev-ref HEAD) \
	--build-arg GIT_REVISION=$(shell git rev-parse --short HEAD) .

run-dev:
	GIT_TAG=$(shell git describe --tags --abbrev=0 HEAD) \
	GIT_BRANCH=$(shell git rev-parse --abbrev-ref HEAD) \
	GIT_REVISION=$(shell git rev-parse --short HEAD) \
	PUBLIC_PATH=/app/ \
	docker-compose -f docker-compose-dev.yml up
