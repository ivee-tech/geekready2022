#!/bin/bash
env="$1" # environment parameter
# generate JSON file
# az bicep build -f ./main.bicep

# create a Azure AD group for AKS cluster admin
aksAdminGroup='zz-aks-admin'
group=$(az ad group show --group $aksAdminGroup)
if [ -z "$group" ]
then
group=$(az ad group create --display-name $aksAdminGroup --mail-nickname $aksAdminGroup)
fi
# set variables
groupId=$(az ad group show --group $aksAdminGroup --query objectId -o tsv)
adminGroupObjectIDs="['${groupId}']"
echo $adminGroupObjectIDs
resourceGroup="zz-${env}" # dev / test
location='AustraliaEast'
# use existing or generate SSH keys
SSH_KEY=$(cat $HOME/.ssh/id_rsa_aks.pub) 
SSH_KEY="${SSH_KEY}\n"
ACR_ROLE=$(az role definition list --name 'AcrPull' | jq -r .[].id)

# create resource group
az group create --name $resourceGroup --location $location

# deploy cluster
paramFile="@parameters_${env}.json"
az deployment group create \
    --resource-group $resourceGroup \
    --template-file ./main.bicep \
    --parameters $paramFile \
    --parameters acrRole=$ACR_ROLE adminGroupObjectIDs=$adminGroupObjectIDs adminPublicKey="$SSH_KEY"

# delete cluster
# az aks delete -g $resourceGroup -n $aksName
