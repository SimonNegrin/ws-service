
REGISTRY=192.168.1.4:5000
IMAGE_NAME=ws-service
IMAGE_TAG=latest

build:
	docker compose build

start:
	docker compose up -d

stop:
	docker compose stop

clear:
	docker compose down -v

docker-tag:
	docker image tag ${IMAGE_NAME} ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}

docker-push:
	docker push ${REGISTRY}/${IMAGE_NAME}
