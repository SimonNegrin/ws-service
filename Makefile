
build:
	docker build -t ws-service-image .

start:
	docker run -d --name ws-service -p 4321:4321 ws-service-image

stop:
	docker stop ws-service

clear:
	docker rm ws-service
