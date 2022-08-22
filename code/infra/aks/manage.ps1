$resourceGroup='zz-dev'
$aksName='zz-dev-aks'

$aksAdminGroup='zz-aks-admin'
$GROUP_ID=$(az ad group show --group $aksAdminGroup --query objectId -o tsv)
az aks update -g $resourceGroup -n $aksName `
    --aad-admin-group-object-ids $GROUP_ID `
    --enable-aad 

# Get credentials
# az aks show --resource-group $resourceGroup --name $aksName
# Get the resource ID of your AKS cluster
$AKS_CLUSTER=$(az aks show --resource-group $resourceGroup --name $aksName --query id -o tsv)

# Get the account credentials for the logged in user;
# AVOID, USE GROUP ASSIGNMENT
# $ACCOUNT_UN=$(az account show --query user.name -o tsv)
# $ACCOUNT_UPN=$(az ad user list --query "[?contains(otherMails,'$ACCOUNT_UN')].{UPN:userPrincipalName}" -o tsv)
# $ACCOUNT_ID=$(az ad user show --id $ACCOUNT_UPN --query objectId -o tsv)

$aksAdminGroup='zz-aks-admin'
$ACCOUNT_ID=$(az ad group show --group $aksAdminGroup --query objectId -o tsv)

# Assign the 'Cluster Admin' role to the user
az role assignment create `
    --assignee $ACCOUNT_ID `
    --scope $AKS_CLUSTER/namespaces/kube-system `
    --role "Azure Kubernetes Service Cluster Admin Role"


$acrAdminGroup='zz-acr-admin'
az ad group create --display-name $acrAdminGroup --mail-nickname $acrAdminGroup
$GROUP_ID=$(az ad group show --group $acrAdminGroup --query objectId -o tsv)
$ACR_ID=$(az acr show --resource-group $resourceGroup --name $acrName --query id -o tsv)
az role assignment create `
    --assignee $GROUP_ID `
    --scope $ACR_ID `
    --role "Owner"

$resourceGroupAKS='zz-dev'
$aksName='zz-dev-aks'
az aks update -g $resourceGroupAKS -n $aksName --enable-managed-identity

$resourceGroupAKS='zz-dev'
$aksName='zz-dev-aks'
$resourceGroupACR='zz-shared'
$acrName='zzacr'
$identity = $(az aks show -g $resourceGroupAKS -n $aksName --query "identity") | ConvertFrom-Json
$principalId = $identity.principalId
$ACR_ID=$(az acr show --resource-group $resourceGroupACR --name $acrName --query id -o tsv)
az role assignment create `
    --assignee $principalId `
    --scope $ACR_ID `
    --role "AcrPull"

# debug node(s)
kubectl get nodes
kubectl debug node/aks-nodepool1-12345678-vmss000000 -it --image=mcr.microsoft.com/aks/fundamental/base-ubuntu:v0.0.11
kubectl debug node/aks-userpool01-36136415-vmss000007 -it --image=mcr.microsoft.com/aks/fundamental/base-ubuntu:v0.0.11

$rg = 'zz-dev'
$aksName = 'zz-dev-aks'
$nodePool = 'userpool01'
az aks nodepool scale --name $nodePool -g $rg --cluster-name $aksName --node-count 0

$acrName = 'zzacr'
$acr = "$acrName.azurecr.io"
az aks check-acr -g $rg -n $aksName --acr $acr

az aks update -n $aksName -g $rg --attach-acr $acrName
