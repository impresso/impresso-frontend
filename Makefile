BUILD_TAG ?= latest

build:
	docker build \
	-t impresso/impresso-frontend:${BUILD_TAG} \
	--build-arg GIT_TAG=${BUILD_TAG} \
	--build-arg GIT_BRANCH=$(shell git rev-parse --abbrev-ref HEAD) \
	--build-arg GIT_REVISION=$(shell git rev-parse --short HEAD) .
