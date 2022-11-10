kubectl config current-context

$resourceGroupName='zz-shared'
$acrName='zzacr'
$loginServer="$acrName.azurecr.io"

# login into ACR
az acr login -n $acrName

docker images

npm run build

# build and test local image
docker build -t hello-geekready-2022:0.0.5 .
docker run -it -p 2999:2999 hello-geekready-2022:0.0.4
# navigate to localhost:2999

# push local image manually
$imageName='hello-geekready-2022'
$tag='0.0.3'
$destTag='0.0.3'
$ns='geekready2022'
$fullSrcImg = "$($imageName):$($tag)"
$fullDestImg = "$loginServer/$ns/$($imageName):$($destTag)"
Write-Output $fullSrcImg
Write-Output $fullDestImg
docker tag $fullSrcImg $fullDestImg
docker push $fullDestImg

# run trivy against the deployed image
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v $HOME/Library/Caches:/root/.cache/ zzacr.azurecr.io/aquasec/trivy --exit-code 0 --severity MEDIUM,HIGH --ignore-unfixed $fullDestImg
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v $HOME/Library/Caches:/root/.cache/ zzacr.azurecr.io/aquasec/trivy --exit-code 1 --severity CRITICAL --ignore-unfixed $fullDestImg

# deploy AKS cluster (Linux)
/bin/bash deploy.sh dev
/bin/bash deploy.sh test

# attach ACR instance to AKS
$resourceGroupName='zz-dev'
$aksName='zz-dev-aks'
$acrName='zzacr'
az aks update -n $aksName -g $resourceGroupName --attach-acr $acrName

# get AKS credentials
$resourceGroupName='zz-dev'
$aksName='zz-dev-aks'
az aks get-credentials -n $aksName -g $resourceGroupName

# deploy rose app and svc to AKS
$ns='geekready2022'
# kubectl create namespace $ns
kubectl apply -f rose-app-dep.yml -n $ns
# deploy v0.0.1
kubectl apply -f rose-app-dep-001.yml -n $ns
# kubectl delete deployment rose-app-dep -n $ns
# deploy LoadBalancer, point to v0.0.1
kubectl apply -f rose-app-svc.yml -n $ns
# kubectl delete svc rose-app-svc -n $ns

kubectl apply -f rose-app-int.yml -n $ns
# kubectl delete svc rose-app-int -n $ns

# deploy HPA
kubectl apply -f rose-app-hpa-cpu.yml -n $ns
kubectl get hpa rose-app-hpa-cpu -n $ns
# kubectl delete hpa rose-app-hpa-cpu -n $ns

# increase load
# internal call - timeout
kubectl run -it load-generator --rm --image=busybox --restart=Never --namespace $ns `
    -- /bin/sh -c "while sleep 0.01; do wget -q -O- http://<IP>:2999; done"
# using external
kubectl run -it load-generator --rm --image=busybox --restart=Never --namespace $ns `
    -- /bin/sh -c "while sleep 0.01; do wget -q -O- http://<EXT_IP>:2999/; done"

# using external, curl
kubectl run -it load-generator --rm --image=busybox --restart=Never --namespace $ns `
    -- /bin/sh -c "while sleep 0.01; do curl -L -v http://<EXT_IP>:2999/  -A \"Mozilla/5.0 (compatible;  MSIE 7.01; Windows NT 5.0)\"; done"

# testing namespace
tns='geekready2021-testing'
kubectl create namespace $tns

# moon for UI / func testing
git clone https://github.com/aerokube/moon-deploy.git
cd moon-deploy

kubectl apply -f moon.yaml

kubectl get svc -n moon

# rose app func test job
$svr='zzacr.azurecr.io'
$ns='geekready2021'
$img='rose-app-func-test'
$tag='latest'
docker tag $($img):$tag $svr/$ns/$($img):$tag
docker push $svr/$ns/$($img):$tag

$tns='geekready2021-testing'
kubectl apply -f rose-app-func-test-job.yml -n $tns

docker run -it zzacr.azurecr.io/geekready2021/rose-app-func-test:latest

# load testing
$svr='zzacr.azurecr.io'
$ns='geekready2021'
$img='rose-app-load-test'
$tag='latest'
docker tag $($img):$tag $svr/$ns/$($img):$tag
docker push $svr/$ns/$($img):$tag

$tns='geekready2021-testing'
kubectl apply -f rose-app-load-test-job.yml -n $tns


# HPA demo
$ns='geekready2021'
kubectl get hpa -n $ns

az acr import -n zzacr --source mcr.microsoft.com/dotnet/samples:aspnetapp --image microsoft/dotnet/samples:aspnetapp
