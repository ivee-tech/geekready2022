# Create Resource Group
az group create -l SoutheastAsia -n az-k8s-fa0k-rg

$userId = $(az ad signed-in-user show --query objectId --out tsv)
# Deploy template with in-line parameters
az deployment group create -g az-k8s-fa0k-rg --template-uri https://github.com/Azure/AKS-Construction/releases/download/0.8.8/main.json `
	--name "main" `
	--parameters `
	resourceName=az-k8s-fa0k `
	upgradeChannel=stable `
	agentCount=2 `
	agentCountMax=2 `
	agentVMSize=Standard_DS3_v2 `
	custom_vnet=true `
	enable_aad=true `
	AksDisableLocalAccounts=true `
	enableAzureRBAC=true `
	adminPrincipalId="$userId"`
	registries_sku=Basic `
	acrPushRolePrincipalId="$userId" `
	omsagent=true `
	retentionInDays=30 `
	networkPolicy=azure `
	azurepolicy=audit `
	authorizedIPRanges="[`"1.157.9.195/32`"]" `
	ingressApplicationGateway=true `
	appGWcount=0 `
	appGWsku=WAF_v2 `
	appGWmaxCount=2 `
	appgwKVIntegration=true `
	keyVaultAksCSI=true `
	keyVaultCreate=true `
	keyVaultOfficerRolePrincipalId="$userId" `
	--name

