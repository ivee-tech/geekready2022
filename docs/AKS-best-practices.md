# AKS Best Practices

## Development

**Use Liveness probes**: Liveness probes are used by kubelet to decide when to restart containers. Applications running for long periods of time could enter broken states and the only way to recover is to restart them.

https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes

**Use Startup probes**: Slow starting containers can use Startup probes which allow the delay of the initial liveness check which may cause deadlocks

https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes

**Use Readiness probe**: Readiness probes are used to check if the pods are able to receive requests. When an application is performing heavy tasks, they may not be able to serve traffic. If a readiness probe is implemented, Kubernetes won't send additional requests to the corresponding pod.

https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes

**Use PreStop hook**: This hook is called immediately before a container is terminated due to an API request or management event such as liveness probe failure, pre-emption, resource contention and others. It can be used when you have critical process you want to finish or save when your pod is destroyed for any reason

https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks

**Use appropriate number of replicas for deployments**: Ensure applications always configure proper replicas for resiliency in the event of a pod crashing or being evicted.

https://kubernetes.io/docs/concepts/workloads/controllers/replicaset

**Apply labels to all resources**: Ensure that your components are tagged / labelled to help filter, assess, and apply relevant policies (could be business, security or technical tags)

https://kubernetes.io/docs/concepts/overview/working-with-objects/labels

**Apply autoscaling**: Automatically scale your application to the number of pods required to handle the current load. This can be achieved by using Horizontal Pod Autoscaler for CPU & Memory or by using KEDA for scaling based on other sources

https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale

https://keda.sh

**Apply proper secrets management**: Use Azure Key Vault to store secrets and don't inject passwords in Docker Images. Secrets are not encrypted in etcd, prefer to store your secrets in a proper HSM like Azure Key Vault. Secrets cand then be injected using  CSI providers.

https://github.com/Azure/secrets-store-csi-driver-provider-azure

https://akv2k8s.io

**Implement Pod Identity**: Avoid using fixed credentials within pods or container images, as it increases the exposure risk. Use pod identities instead, to automatically request access using a central Azure AD identity.

When accessing Azure services such as Cosmos DB, Key Vault, or Blob Storage, pods  can request access tokens which have permissions only to the assigned resources. Managed identities for Azure resources (currently implemented as an associated AKS open source project) let you automatically request access to services through Azure AD. 

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-identity#use-pod-identities

https://azure.github.io/aad-pod-identity/docs/configure/aad_pod_identity_on_kubenet

**Use Kubernetes namespaces**: The namespaces allow to properly isolate Kubernetes resources, give the ability to create logical tenants / partitions and enforce separation of your resources. Scope of user permissions can be limited as well. Avoid using the default namespace and create your own namespaces instead.

https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-cluster-isolation

**Set up resource requests and limits**: Requests and limits help the scheduler make better decisions about which nodes to place pods on and avoid exhaustion of resources such as CPU or memory.

https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/

https://docs.microsoft.com/en-us/azure/aks/developer-best-practices-resource-management 

**Specify pod security context**: Define privilege and access control settings for a Pod or Container and control the container capabilities and rights. Apply the least-privilege principle when giving pod / container rights.

https://kubernetes.io/docs/tasks/configure-pod-container/security-context

https://docs.microsoft.com/en-us/azure/aks/developer-best-practices-pod-security

**Ensure resource manifests respect good practices**: Evaluate the resource definitions / manifests follow good practices. Apply evaluation using specific tools such as kube-score or kube linters.

https://kube-score.com

https://www.checkov.io

https://github.com/stackrox/kube-linter

**Scan Dockerfile definitions**: Use appropriate tools to scan Docker files to ensure Docker Image Security Best Practices.  Define a baseline for image build pipelines and ensure it is followed by the development teams.

https://snyk.io/blog/10-docker-image-security-best-practices/

https://dev.to/chrisedrego/21-best-practise-in-2021-for-dockerfile-1dji

https://snyk.io/

https://github.com/goodwithtech/dockle#features

https://github.com/hadolint/hadolint

**Static Analysis of Docker Images on Build**: Shift left static analysis and vulnerability verification of Docker images in CI/CD pipelines

https://docs.microsoft.com/en-us/azure/security-center/defender-for-container-registries-introduction

https://docs.paloaltonetworks.com/prisma/prisma-cloud/prisma-cloud-admin-compute/tools/twistcli_scan_images

https://docs.aquasec.com/docs/image-scanning

https://qualysguard.qg2.apps.qualys.com/cs/help/vuln_scans/docker_images.htm

https://www.stackrox.com/use-cases/vulnerability-management/

https://github.com/quay/clair

**Threshold enforcement of Docker Image Builds**: Restrict Docker Image builds that contain vulnerabilities. There are tools available which can be used to setup a restriction threshold, but not compromise the development flow. Build restriction is based on Critical or High vulnerabilities.

https://docs.paloaltonetworks.com/prisma/prisma-cloud/prisma-cloud-admin-compute/vulnerability_management/vuln_management_rules.html

https://www.stackrox.com/use-cases/vulnerability-management

https://docs.aquasec.com/docs/proactive-risk-management

**Compliance enforcement of Docker Image Builds**: Assess and restrict the Compliance state of an image on build.

Some examples of non-compliant images: image running as 'root' before it gets deployed, opening up port 3389 or 22

https://docs.microsoft.com/en-us/azure/aks/policy-samples

https://docs.paloaltonetworks.com/prisma/prisma-cloud/prisma-cloud-admin-compute/compliance/manage_compliance.html

https://docs.aquasec.com/docs/image-assurance-policies-basic-info

https://www.stackrox.com/use-cases/compliance

**Quickly containerize your applications using tools such as Azure Migrate**: Azure Migrate contains an App Containerization tool which provides a point-and-containerize approach to redeploy applications as containers with minimal code changes, by using the app running state. It only supports ASP.NET applications and Java web applications running on Apache Tomcat.

https://docs.microsoft.com/en-us/azure/migrate/tutorial-app-containerization-aspnet-kubernetes

https://docs.microsoft.com/en-us/azure/migrate/tutorial-app-containerization-java-kubernetes


## Image Management
(see ACR Best Practices)

**Scan Container Images**: Scan your container images against vulnerabilities to ensure there are no critical or high vulnerabilities. Mitigate the risks against found vulnerabilities and monitor for vendor updates if not possible to eliminate vulnerabilities introduced by base images.

**Restrict the registries used for deployment**: Restrict the images that can be deployed in the AKS cluster, as well as the registries used to pull images from. Use private registries rather than public ones.

**Runtime Security of Applications**: Integrate Runtime Security for your pods. To complete the defence in depth structure, ensure Runtime protection is in place to protect from process, network, storage and system call attacks.

**Quarantine of Docker Images in Docker Registries that have discovered issues**: Use policy to protect images from drift while in the registry, on both push and pull.

**RBAC to Docker Registries**: The Azure Container Registry service supports a set of built-in Azure roles that provide different levels of permissions to an Azure container registry. Use Azure role-based access control (RBAC) to assign specific permissions to users, service principals, or other identities that need to interact with a registry.

**Network Segmentation of Docker Registries**: Limit access to a registry by assigning virtual network private IP addresses to the registry endpoints and using Azure Private Link. Network traffic between the clients on the virtual network and the registry's private endpoints traverses the virtual network and a private link on the Microsoft backbone network, eliminating exposure from the public internet. Private Link also enables private registry access from on-premises through Azure Express Route private peering or a VPN gateway.

**Prefer distroless images**: When building a docker image, try to use the distroless version of the base OS image, to reduce the risk of vulnerabilities with preinstalled but unused tools. From example, use base-debian10 instead of debian10.

## Cluster Setup

**Logically isolate cluster**: Use logical isolation to separate tenants, solutions, teams and projects. Try to minimize the number of physical AKS clusters you deploy to isolate teams or applications

**Physically isolate cluster**: Minimize the use of physical isolation for each separate team or application deployment

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-cluster-isolation

**IP Range authorization**: The API server is the central way to interact with your cluster. To improve cluster security and minimize attacks, the API server should only be accessible from a limited set of IP address ranges. By using a private cluster, you can ensure that network traffic between your API server and your node pools remains on the private network only. Because the API server has a private address, it means that to access it for administration or for deployment, you need to set up a private connection, like using a 'jumpbox' (i.e.: Azure Bastion)

**AAD Integration**: Azure Kubernetes Service (AKS) can be configured to use Azure Active Directory (Azure AD) for user authentication. In this configuration, you can sign in to an AKS cluster by using your Azure AD authentication token.

**Use System Node Pools**: Separate the system workloads from the user workloads by having a dedicated system node pool

**AKS Managed Identity**: For authentication with other Azure services, AKS clusters need either a Managed Identity or Service Principal. It is recommended to use Managed Identity in AKS

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-identity

**VM Sizing**: Prefer fewer, larger clusters over of many, smaller clusters. Make sure you use the appropriate VM size / series for the workloads running in the cluster. For example, most workloads can be covered by the VM sizes Standard_D2s_v3 with 2 vCPUs and 8 GB memory or Standard_D4s_v3 with 4 vCPUs and 16 GB memory. If you need additional resources, look for the appropriate series, such as compute-optimised F-series.

https://github.com/Azure/k8s-best-practices/blob/master/Cost_Optimization.md#node---vm-sizes

**Configure your cluster for regulated industries**: Some industries have their own established standards and regulations to which the members must adhere. 

https://docs.microsoft.com/en-us/azure/aks/use-multiple-node-pools#add-a-fips-enabled-node-pool-preview

https://www.cisecurity.org/cis-benchmarks/

https://docs.microsoft.com/en-us/azure/architecture/reference-architectures/containers/aks-pci/aks-pci-intro

**Set Upgrade Channel**: In addition to manually upgrading a cluster, you can set an auto-upgrade channel on your cluster

https://docs.microsoft.com/en-us/azure/aks/upgrade-cluster#set-auto-upgrade-channel

**K8S RBAC + AAD Integration**: Control access to cluster resources using Kubernetes role-based access control and Azure Active Directory identities in Azure Kubernetes Service

https://kubernetes.io/docs/reference/access-authn-authz/rbac/ 

https://docs.microsoft.com/en-us/azure/aks/azure-ad-rbac

**Private cluster**: In a private cluster, the control plane or API server has internal IP addresses and is not exposed to Internet

https://docs.microsoft.com/en-us/azure/aks/private-clusters

**Enable cluster autoscaling**: To keep up with application demands in Azure Kubernetes Service (AKS), you may need to adjust the number of nodes that run your workloads. The cluster autoscaler component can watch for pods in your cluster that can't be scheduled because of resource constraints.

https://docs.microsoft.com/en-us/azure/aks/cluster-autoscaler 

**Node count**: The VM size as well as node count are critical questions which require in-depth analysis of the workloads deployed on AKS clusters

**Refresh container when base image is updated**: As you use base images for application images, use automation to build new images when the base image is updated. As those base images typically include security fixes, update any downstream application container images.

**Kubernetes dashboard**: Starting with Kubernetes version 1.19, AKS will no longer allow the managed Kubernetes dashboard add-on to be installed for security reasons.

https://docs.microsoft.com/en-us/azure/aks/kubernetes-dashboard

**AKS - ACR integration without password**: AKS can authenticate to ACR without using any password, but by using either Service Principal or Managed Identity.

https://docs.microsoft.com/en-us/azure/aks/cluster-container-registry-integration?tabs=azure-cli

**Use placement proximity group to improve performance**: When deploying your application in Azure, spreading Virtual Machine (VM) instances across regions or availability zones creates network latency, which may impact the overall performance of your application. A proximity placement group is a logical grouping used to make sure Azure compute resources are physically located close to each other.

https://docs.microsoft.com/en-us/azure/aks/reduce-latency-ppg

**Encrypt ETCD at rest with your own key**: By default, ETCD (Kubernetes back-end DB) is encrypted at rest with keys managed by Microsoft. It is possible to encrypt the database using your own key using a KMS plugin and store the key in Azure Key Vault.

https://github.com/Azure/kubernetes-kms/blob/master/README.md


## Business Continuity / Disaster Recovery

**Ensure you can perform a whitespace deployment**: A whitespace (greenfield) deployment is the exercise to delete everything and to redeploy the whole platform in an automated way. Use CI/CD mechanisms to test full redeployment of the cluster infrastructure and workloads / applications.

https://docs.microsoft.com/en-us/azure/architecture/solution-ideas/articles/container-cicd-using-jenkins-and-kubernetes-on-azure-container-service

https://docs.microsoft.com/en-us/azure/architecture/example-scenario/apps/devops-with-aks

https://azuredevopslabs.com/labs/vstsextend/kubernetes/

**Use availability zones**: An Azure Kubernetes Service (AKS) cluster distributes resources such as the nodes and storage across logical sections of the underlying Azure compute infrastructure. This deployment model makes sure that the nodes run across separate update and fault domains in a single Azure data center.

https://docs.microsoft.com/en-us/azure/aks/availability-zones

**Plan for multi-region deployment**: When you deploy multiple AKS clusters, choose regions where AKS is available, and use paired regions.

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-multi-region#plan-for-multiregion-deployment

**Use Azure Traffic Manager to route traffic**: Azure Traffic Manager can direct customers to their closest AKS cluster and application instance. For the best performance and redundancy, direct all application traffic through Traffic Manager before it goes to your AKS cluster.

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-multi-region#use-azure-traffic-manager-to-route-traffic

**Create a storage migration plan**: Your applications might use Azure Storage for their data. Because your applications are spread across multiple AKS clusters in different regions, you need to keep the storage synchronized

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-multi-region#create-a-storage-migration-plan

https://pumpingco.de/blog/backup-and-restore-a-kubernetes-cluster-with-state-using-velero/

**Uptime SLA**: Uptime SLA is an optional feature to enable a financially backed, higher SLA for a cluster. It provides you a 99.95% SLA instead of the 99.5% SLO and is relevant for your production clusters

https://docs.microsoft.com/en-us/azure/aks/uptime-sla


## Storage

**Choose the right storage type**: Understand the needs of your application to pick the right storage. Use high performance, SSD-backed storage for production workloads. Plan for network-based storage when there is a need for multiple concurrent connections.

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-storage#choose-the-appropriate-storage-type

**Size the nodes for storage needs**: Each node size supports a maximum number of disks. Different node sizes also provide different amounts of local storage and network bandwidth. Plan for your application demands to deploy the appropriate size of nodes.

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-storage#size-the-nodes-for-storage-needs

**Dynamically provision volumes**: To reduce management overhead and let you scale, don't statically create and assign persistent volumes. Use dynamic provisioning. In your storage classes, define the appropriate reclaim policy to minimize unneeded storage costs once pods are deleted.

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-storage#dynamically-provision-volumes

**Secure and back up your data**: Back up your data using an appropriate tool for your storage type, such as Velero or Azure Site Recovery

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-storage#secure-and-back-up-your-data

**Make your storage resilient**: Where possible, don't store service state inside the container. Instead, use an Azure platform as a service (PaaS) that supports multi-region replication, such as Azure Redis or Azure Sql Database.

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-multi-region#remove-service-state-from-inside-containers

## Network

**Choose the appropriate network model**: The default network type used by K8S is Kubenet (basic, simple network plugin for Linux only). For integration with existing virtual networks or on-premises networks, use Azure CNI networking in AKS. This network model also allows greater separation of resources and controls in an enterprise environment but be aware of the impact on the network topology/IP ranges

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-network#choose-the-appropriate-network-model

https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/#kubenet

https://github.com/Azure/azure-container-networking/blob/master/docs/cni.md

**Plan IP addresses**: The size of your virtual network and its subnet must accommodate the number of pods you plan to run and the number of nodes for the cluster. Ensure the IP address ranges of VNets / subnets used by the cluster or peered don't overlap.

https://docs.microsoft.com/en-us/azure/aks/configure-azure-cni#plan-ip-addressing-for-your-cluster

**Distribute ingress traffic**: To distribute HTTP or HTTPS traffic to your applications, use ingress resources and controllers. Ingress controllers provide additional features over a regular Azure load balancer, and can be managed as native Kubernetes resources.

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-network#distribute-ingress-traffic

**Secure traffic with a Web Application Firewall (WAF)**: If you plan to host exposed applications, to scan incoming traffic for potential attacks, use a web application firewall (WAF) such as Barracuda WAF for Azure or Azure Application Gateway. These more advanced network resources can also route traffic beyond just HTTP and HTTPS connections or basic SSL termination.

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-network#secure-traffic-with-a-web-application-firewall-waf

**Don't expose your load-balancer on Internet if not necessary**: There is almost no reason to directly expose the ingress entry point to Internet but by default AKS create a public one. You can create an internal one only.

https://docs.microsoft.com/en-us/azure/aks/ingress-internal-ip

**Control traffic flow with network policies**: Use network policies to allow or deny traffic to pods. By default, all traffic is allowed between pods within a cluster. For improved security, define rules that limit pod communication.

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-network#control-traffic-flow-with-network-policies

https://docs.projectcalico.org/reference/resources/networkpolicy

https://cilium.io/

**Configure default network policies in each namespace**: Start by creating a deny all policy in each namespace and then add specific policies.
https://github.com/ahmetb/kubernetes-network-policy-recipes

**Prevent data-leaking with egress lockdown**: Use Azure Firewall to secure and control all egress traffic going outside of the cluster.

https://docs.microsoft.com/en-us/azure/aks/limit-egress-traffic

**Don't expose your container registry on Internet**: Use Azure Firewall to secure and control all egress traffic going outside of the cluster.

https://docs.microsoft.com/en-us/azure/aks/limit-egress-traffic

**Securely connect to nodes through a bastion host**: Don't expose remote connectivity to your AKS nodes. Create a bastion host, or jump box, in a management virtual network. Use the bastion host to securely route traffic into your AKS cluster to remote management tasks.

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-network#securely-connect-to-nodes-through-a-bastion-host


## Resource Management

**Enforce resource quotas**: Plan and apply resource quotas at the namespace level. If pods don't define resource requests and limits, reject the deployment. Monitor resource usage and adjust quotas as needed.

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-scheduler#enforce-resource-quotas

https://kubernetes.io/docs/concepts/policy/resource-quotas/

**Set memory limits and requests for all containers**: Set CPU and memory limits and requests to all the containers. It prevents memory leaks and CPU over-usage and protects the whole platform

https://docs.microsoft.com/en-us/azure/aks/developer-best-practices-resource-management#define-pod-resource-requests-and-limits

https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource

**Configure pod disruption budgets**: To maintain the availability of applications, define Pod Disruption Budgets (PDBs) to make sure that a minimum number of pods are available in the cluster.

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-scheduler#plan-for-availability-using-pod-disruption-budgets

https://kubernetes.io/docs/tasks/run-application/configure-pdb/

**Set up cluster auto-scaling**: To maintain the availability of applications and guaranty available resources, set up cluster auto-scaling

https://docs.microsoft.com/en-us/azure/aks/cluster-autoscaler

**Provide dedicated nodes using taints and tolerations**: Limit access for resource-intensive applications, such as ingress controllers, to specific nodes. Keep node resources available for workloads that require them, and don't allow scheduling of other workloads on the nodes.

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-advanced-scheduler#provide-dedicated-nodes-using-taints-and-tolerations

**Control pod scheduling using node selectors and affinity**: Control the scheduling of pods on nodes using node selectors, node affinity, or inter-pod affinity. These settings allow the Kubernetes scheduler to logically isolate workloads, such as by hardware in the node.
https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-advanced-scheduler#control-pod-scheduling-using-node-selectors-and-affinity

## Multi-Tenancy

**Enable geo-replication for container images**: Companies that want a local presence, or a hot backup, choose to run services from multiple Azure regions.

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-multi-region#enable-geo-replication-for-container-images

**Enable traffic management**: Azure Traffic Manager can direct customers to their closest AKS cluster and application instance. For the best performance and redundancy, direct all application traffic through Traffic Manager before it goes to your AKS cluster.

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-multi-region#use-azure-traffic-manager-to-route-traffic

## Cluster Maintenance

**Maintain Kubernetes version up to date**: To stay current on new features and bug fixes, regularly upgrade to the Kubernetes version in your AKS cluster. Support for Kubernetes is current and N-2 versions only

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-cluster-security#regularly-update-to-the-latest-version-of-kubernetes

https://docs.microsoft.com/en-us/azure/architecture/operator-guides/aks/aks-upgrade-practices#cluster-upgrades

https://docs.microsoft.com/en-us/azure/aks/upgrade-cluster

**Keep nodes up to date and patched**: AKS supports upgrading the images on a node so you're up to date with the newest OS and runtime updates. AKS provides one new image per week with the latest updates, so it's beneficial to upgrade your node's images regularly for the latest features, including Linux or Windows patches

https://docs.microsoft.com/en-us/azure/architecture/operator-guides/aks/aks-upgrade-practices

https://docs.microsoft.com/en-us/azure/aks/node-image-upgrade

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-cluster-security#process-linux-node-updates-and-reboots-using-kured

https://docs.microsoft.com/en-us/azure/aks/quickstart-event-grid

https://github.com/weaveworks/kured

**Securely connect to nodes through a bastion host**: Don't expose remote connectivity to your AKS nodes. Create a bastion host, or jump box, in a management virtual network. Use the bastion host to securely route traffic into your AKS cluster to remote management tasks.

https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-network#securely-connect-to-nodes-through-a-bastion-host

**Regularly check for cluster issues**: Regularly run cluster scanning to detect issues in AKS cluster. You can use tools like kubestriker to detect misconfiguration and security issues. For instance, if you apply resource quotas on an existing AKS cluster, kubestriker can find pods that don't have resource requests and limits defined.

https://github.com/vchinnipilli/kubestriker

https://www.kubestriker.io/

https://www.alcide.io/kubernetes-advisor

https://github.com/aquasecurity/kube-bench

**Monitor the security of your cluster with Azure Security Center**: Security Center brings security benefits to your AKS clusters using data already gathered by the AKS master node. Use Azure Defender for Kubernetes provides environment hardening, workload protection, and run-time protection.

https://docs.microsoft.com/en-us/azure/security-center/defender-for-kubernetes-introduction

https://docs.microsoft.com/en-us/azure/security-center/container-security

https://docs.microsoft.com/en-us/azure/security-center/azure-kubernetes-service-integration

**Provision a log aggregation tool**: Use Azure Monitor to get information about what happens in your cluster. Monitor the health of the cluster (nodes, server), but also the workloads (deployments, pods, jobs etc.)

https://docs.microsoft.com/en-us/azure/aks/monitor-aks

https://www.elastic.co/elastic-cloud-kubernetes

https://www.datadoghq.com/

**Enable master node logs**: To help troubleshoot your application and services, you may need to view the logs generated by the master components.

https://docs.microsoft.com/en-us/azure/aks/view-control-plane-logs

https://docs.microsoft.com/en-us/azure/aks/troubleshooting

**Collect metrics**: If default integration can collect telemetry data and basic metrics (CPU/Memory), they don't collect custom metrics and more detailed information. It's often necessary to install a 3rd party software such as Prometheus is recommend within Kubernetes) and they store these metrics to exploit them.

https://docs.microsoft.com/en-us/azure/azure-monitor/insights/container-insights-prometheus-integration

https://www.elastic.co/guide/en/cloud-on-k8s/current/k8s-quickstart.html

https://docs.microsoft.com/en-us/azure/aks/monitor-aks

https://prometheus.io/

https://www.prometheus.io/docs/visualization/grafana/

https://logz.io/blog/prometheus-and-grafana-a-match-made-in-heaven/

**Configure distributed tracing**: Distributed tracing, also called distributed request tracing, is a method used to profile and monitor applications, especially those built using a microservices architecture. Distributed tracing helps pinpoint where failures occur and what causes poor performance.

https://docs.microsoft.com/en-us/azure/azure-monitor/app/distributed-tracing

https://docs.microsoft.com/en-us/azure/architecture/microservices/logging-monitoring

https://github.com/microsoft/Application-Insights-K8s-Codeless-Attach

**Control the compliance with Azure Policies**: Azure Policy integrates with the Azure Kubernetes Service (AKS) to apply at-scale enforcements and safeguards on your clusters in a centralized, consistent manner.

https://docs.microsoft.com/en-us/azure/aks/security-controls-policy

https://docs.microsoft.com/en-us/azure/governance/policy/concepts/rego-for-aks

https://github.com/open-policy-agent/gatekeeper

**Read The Definitive Guide to Securing Kubernetes**: This whitepaper provides an overview of key aspects and best practices of K8s security

https://info.aquasec.com/securing_kubernetes

https://github.com/open-policy-agent/gatekeeper

**Enable Azure Defender for Kubernetes**: Azure Defender for Kubernetes provides protections for your Kubernetes clusters wherever they're running (AKS and on-premises)

https://docs.microsoft.com/en-us/azure/security-center/defender-for-kubernetes-introduction 

**Use Azure Key Vault**: Use Azure Key Vault to store Secrets and Certificates

https://docs.microsoft.com/en-us/azure/key-vault/general/key-vault-integrate-kubernetes

https://docs.microsoft.com/en-us/azure/aks/developer-best-practices-pod-security

**Use GitOps**: GitOps works by using Git as a single source of truth for declarative infrastructure and applications

https://docs.microsoft.com/en-us/azure/architecture/example-scenario/gitops-aks/gitops-blueprint-aks

https://www.weave.works/technologies/gitops

**Use Kubernetes tools**: The Kubernetes ecosystem is very large and often updated and strengthened by many tools that make operating it easier:

Helm: https://helm.sh/

kubectl aliases: https://github.com/ahmetb/kubectl-aliases

kubectx: https://github.com/ahmetb/kubectx

k9s: https://k9scli.io

### Resources

- AKS Best Practices

https://docs.microsoft.com/en-us/azure/aks/best-practices

- AKS Checklist

https://www.the-aks-checklist.com/

- K8S Best Practices - WIP

https://github.com/Azure/k8s-best-practices  

- Optimize compute costs on AKS (learning module)

https://docs.microsoft.com/en-us/learn/modules/aks-optimize-compute-costs/

- Cloud Adoption Framework - Kubernetes

https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/innovate/kubernetes/

