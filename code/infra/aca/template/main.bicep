param subscriptionId string
param name string
param location string
param environmentId string
param containers array
param secrets array
param registries array
param environmentName string
param workspaceName string
param workspaceLocation string

resource name_resource 'Microsoft.App/containerapps@2022-01-01-preview' = {
  name: name
  kind: 'containerapps'
  location: location
  properties: {
    configuration: {
      secrets: secrets
      registries: registries
      activeRevisionsMode: 'Single'
    }
    template: {
      containers: containers
      scale: {
        minReplicas: 0
      }
    }
    managedEnvironmentId: environmentId
  }
  dependsOn: [
    environmentName_resource
  ]
}

resource environmentName_resource 'Microsoft.App/managedEnvironments@2022-03-01' = {
  name: environmentName
  location: location
  properties: {
    internalLoadBalancerEnabled: false
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: reference('Microsoft.OperationalInsights/workspaces/${workspaceName}', '2020-08-01').customerId
        sharedKey: listKeys('Microsoft.OperationalInsights/workspaces/${workspaceName}', '2020-08-01').primarySharedKey
      }
    }
  }
  dependsOn: [
    workspaceName_resource
  ]
}

resource workspaceName_resource 'Microsoft.OperationalInsights/workspaces@2020-08-01' = {
  name: workspaceName
  location: workspaceLocation
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    workspaceCapping: {
    }
  }
  dependsOn: []
}