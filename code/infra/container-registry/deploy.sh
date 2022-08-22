# generate JSON file
# az bicep build -f ./azuredeploy.bicep

resourceGroup='zz-shared'
location='AustraliaEast'

# create resource group
az group create --name $resourceGroup --location $location

# deploy ACR instance
acrName='zzacr'
acrSku='Basic'
az deployment group create \
    --resource-group $resourceGroup \
    --template-file ./azuredeploy.bicep \
    --parameters @azuredeploy.parameters.json \
    --parameters acrName=$acrName acrSku=$acrSku

# delete ACR instance
# az acr delete -g $resourceGroup -n $acrName
