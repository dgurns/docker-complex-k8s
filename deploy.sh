docker build -t dgurney/docker-complex-client -f ./client/Dockerfile ./client
docker build -t dgurney/docker-complex-server -f ./server/Dockerfile ./server
docker build -t dgurney/docker-complex-worker -f ./worker/Dockerfile ./worker
docker push dgurney/docker-complex-client
docker push dgurney/docker-complex-server
docker push dgurney/docker-complex-worker
kubectl apply -f k8s
kubectl set image deployments/server-deployment server=dgurney/docker-complex-server