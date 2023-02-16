# ACR Best Practices

## Network-close deployment
Ensure the ACR instance is in the same region as the container consumers (i.e. AKS). When the registry is in the same region, the latency is lower, the speed to spin up container increases reducing the egress costs.

## Use geo-replication
If planning deployments across multiple regions, take advantage of the ACR geo-replication feature (only available on the Premium tire, not with Standard and Basic).

https://docs.microsoft.com/en-us/azure/container-registry/container-registry-geo-replication
https://docs.microsoft.com/en-us/azure/container-registry/container-registry-tutorial-prepare-registry

## Maximize pull performance
Smaller images improve performance and help reduce costs. Use the appropriate tier based on requirements.

For example, use Basic for Dev/Test scenarios, but Standard or Premium for high storage quota, bandwidth or networking needs.

Use multi-stage builds to include only the necessary runtime components.

Use smaller base images, such as alpine.

Avoid installing un-necessary software package which may increase the size and attack surface.

Use a smaller number of layers when building an image - an optimal number is 5 - 10 layers.

## Use namespaces
Namespaces provide great isolation and allow different groups / teams share the same registry.

Namespaces can be nested, allowing for fine-grained ownership.

Examples: 
- autotestingacr.azurecr.io/dotnet-runtime:5.0
- autotestingacr.azurecr.io/laat/selenoid:1.0.0
- autotestingacr.azurecr.io/laat/adms/load-test:1.0.0

## Dedicated resource group
Container registries can be shared by multiple services which could exist potentially in other resource groups.

ACR instance and its consumers (ACI, AKS, App Service) most likely have different lifecycle and putting the container registry in its dedicated resource group will prevent accidental deletion if the consumer resource group is deleted.

## Authentication and authorization
There are two authentication scenarios when working with ACR:
 - Individual identity - developer pulling images 
 - Headless / service identity - puling / pushing images via an Azure DevOps pipeline

Use RBAC such as AcrPull and AcrPush to assign appropriate permissions to different users, service principals, or other identities that perform different registry operations.

https://docs.microsoft.com/en-us/azure/container-registry/container-registry-authentication
https://docs.microsoft.com/en-us/azure/container-registry/container-registry-roles

## Manage registry size
Use the appropriate tier for your scenarios:
- Basic for getting started and Dev/Test scenarios
- Standard for most production applications
- Premium for hyper-scale performance and geo-replication

Keep the registry size at a minimum by deleting un-necessary images, unused tags or untagged images (dangling or orphaned).

https://docs.microsoft.com/en-us/azure/container-registry/container-registry-skus
https://docs.microsoft.com/en-us/azure/container-registry/container-registry-delete

## Image Tags
Image authors can use stable tags or unique tags for image tagging.

Stable tags are recommended for maintaining base images used by development teams. 

Example: <image>:1.0

Unique tags are recommended for deployments

Practices used for setting unique tags:
- Date-time stamp - ensures uniqueness, but could be confusing if teams work in different time zones
- Git commit - good approach, but not working if supporting base images (stable tags)
- Manifest digest - unique SHA-256 hash, ensures uniqueness, but long and difficult to read
- Build ID - good approach as ensures uniqueness and consistency; may be used in correlation with the build system - Azure Pipelines, GitHub Actions, Jenkins
- Semantic Version - good, common approach, familiar for development teams, may require manual changes, especially for the major / minor components 

https://docs.microsoft.com/en-us/azure/container-registry/container-registry-image-tag-version

Delete unused tags or untagged images (dangling or orphaned).

Use auto-purge for untagged manifests or images older than a specified period or set retention policy for untagged manifests.

https://docs.microsoft.com/en-us/azure/container-registry/container-registry-auto-purge
https://docs.microsoft.com/en-us/azure/container-registry/container-registry-retention-policy

## Lock deployed image tags
It is recommended to lock the deployed image tags by setting the write-enabled attribute to false.

This operation is different than regular lock of Azure resources.

This will prevent from inadvertently removing an image from the registry and possibly disrupting deployments.

Example: 
``` bash
az acr repository update --name myregistry --image myrepo/myimage:tag --write-enabled false
```

### Resurces
- ACR Best Practices

https://docs.microsoft.com/en-us/azure/container-registry/container-registry-best-practices 

- ACR tiers

https://docs.microsoft.com/en-us/azure/container-registry/container-registry-skus#service-tier-features-and-limits
