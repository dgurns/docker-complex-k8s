docker build -t dgurney/docker-complex-client:latest -t dgurney/docker-complex-client:$SHA -f ./client/Dockerfile ./client
docker build -t dgurney/docker-complex-server:latest -t dgurney/docker-complex-server:$SHA -f ./server/Dockerfile ./server
docker build -t dgurney/docker-complex-worker:latest -t dgurney/docker-complex-worker:$SHA -f ./worker/Dockerfile ./worker
docker push dgurney/docker-complex-client:latest
docker push dgurney/docker-complex-server:latest
docker push dgurney/docker-complex-worker:latest
docker push dgurney/docker-complex-client:$SHA
docker push dgurney/docker-complex-server:$SHA
docker push dgurney/docker-complex-worker:$SHA
kubectl apply -f k8s
kubectl set image deployments/client-deployment client=dgurney/docker-complex-client:$SHA
kubectl set image deployments/server-deployment server=dgurney/docker-complex-server:$SHA
kubectl set image deployments/worker-deployment worker=dgurney/docker-complex-worker:$SHA