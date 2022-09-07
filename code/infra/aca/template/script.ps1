$rgAcr = 'zz-shared'
$rg = 'zz-aca'
$acrName = 'zzacr'
$location = 'AustraliaEast'
az group create -n $rg -l $location

$acrUser = $(az acr credential show -n $acrName --query username -o tsv)
$acrPassword = $(az acr credential show -n $acrName --query "passwords[0].value" -o tsv)

$acrUser
$acrPassword

$ns = 'geekready2022'
$appName = 'hello-rose-world'
$v = '0.0.1'
$envName = "$appName-env"
az deployment group create -n $appName-deployment `
  -g $rg `
  --template-file ./main.bicep `


az bicep decompile -f template.json

# HW image
mcr.microsoft.com/azuredocs/containerapps-helloworld:latest
# sample image
zzacr.azurecr.io/microsoft/dotnet/samples:aspnetapp