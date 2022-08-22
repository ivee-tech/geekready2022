param(
    [string]$env
)

# generate JSON file
# az bicep build -f ./main.bicep

# get the Azure AD group for AKS cluster admin
$aksAdminGroup='zz-aks-admin'
$groupId=$(az ad group show --group $aksAdminGroup --query objectId -o tsv)
$adminGroupObjectIDs="['${groupId}']"
echo $adminGroupObjectIDs
$resourceGroup="zz-${env}" # dev / test
$location='AustraliaEast'
# use existing or generate SSH keys
$SSH_KEY=$(cat $env:HOMEPATH/.ssh/id_rsa_aks.pub) 
$SSH_KEY="${SSH_KEY}\n"
$ACR_ROLE=$(az role definition list --name 'AcrPull' | jq -r .[].id)

# create resource group
az group create --name $resourceGroup --location $location

# deploy cluster
$paramFile="@parameters_$env.json"
az deployment group create `
    --resource-group $resourceGroup `
    --template-file ./main.bicep `
    --parameters $paramFile `
    --parameters acrRole=$ACR_ROLE adminGroupObjectIDs=$adminGroupObjectIDs adminPublicKey="$SSH_KEY"

# delete cluster
# az aks delete -g $resourceGroup -n $aksName
