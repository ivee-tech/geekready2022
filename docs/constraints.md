# AKS Cluster Constraints

The AKS cluster security constraints are applied via admission controller, used as add-on to the cluster configuration. The constraints are based on Azure policies.

For more information, see this link:
https://docs.microsoft.com/en-gb/azure/governance/policy/concepts/policy-for-kubernetes

The following PowerShell script can be used to identify and inspect the policies /constraints applied to the cluster:

``` PowerShell
$constraintTemplates = $(kubectl get constrainttemplates -o custom-columns=name:metadata.name --no-headers)
$constraintTemplates | ForEach-Object {
    $ct = $_
    $constraints = $(kubectl get $ct -o custom-columns=name:metadata.name --no-headers)
    $constraints | ForEach-Object {
        $c = $_
        kubectl get $ct $c -o yaml > C:\Developer\Data\constraint-templates\$ct.$c.yml
    }
}
```

Some system napespaces are excluded from the policies evaluation.
Check for the following configuration in the constraint Yaml:

``` Yaml
excludedNamespaces:
- kube-system
- gatekeeper-system
- azure-arc
```

Constraints can have enforced action dryrun, which allows the evaluation before allowing / denying. 

You can identify the constraint status and potential violations. Look for `status`,  `totalViolations` and `violations` sections in the Yaml configuration.

For example, for **K8sAzureVolumeTypes** template, find the corresponding constraint:

``` PowerShell
kubectl get K8sAzureVolumeTypes
<#
NAME                                                AGE
azurepolicy-psp-volume-types-f4c42ab9e8b9603c31a1   121d
#>

kubectl get K8sAzureVolumeTypes azurepolicy-psp-volume-types-f4c42ab9e8b9603c31a1 -o yaml

```

Check for status and violations:

``` yaml
status:
  auditTimestamp: "2021-12-14T22:53:51Z"
  byPod:
  - constraintUID: f0723021-dae9-4513-aad9-f04e0741d97e
    enforced: true
    id: gatekeeper-audit-7bfb4b455c-d6ld2
    observedGeneration: 1
    operations:
    - audit
    - status
  - constraintUID: f0723021-dae9-4513-aad9-f04e0741d97e
    enforced: true
    id: gatekeeper-controller-59bdf5d4cb-4b2fk
    observedGeneration: 1
    operations:
    - webhook
  - constraintUID: f0723021-dae9-4513-aad9-f04e0741d97e
    enforced: true
    id: gatekeeper-controller-59bdf5d4cb-xtwhx
    observedGeneration: 1
    operations:
    - webhook
  totalViolations: 2
  violations:
  - enforcementAction: deny
    kind: Pod
    message: 'The volume type csi is not allowed, pod: ngingress-test-ingress-nginx-controller-6ddf8b7474-gpg5g.
      Allowed volume types: ["configMap", "emptyDir", "projected", "secret", "downwardAPI",
      "persistentVolumeClaim"]'
    name: ngingress-test-ingress-nginx-controller-6ddf8b7474-gpg5g
    namespace: ingress-test
  - enforcementAction: deny
    kind: Pod
    message: 'The volume type csi is not allowed, pod: ngingress-test-ingress-nginx-controller-6ddf8b7474-wmgjn.
      Allowed volume types: ["configMap", "emptyDir", "projected", "secret", "downwardAPI",
      "persistentVolumeClaim"]'
    name: ngingress-test-ingress-nginx-controller-6ddf8b7474-wmgjn
    namespace: ingress-test
```

## Allowed Capabilities
template: **K8sAzureAllowedCapabilities**

displayName: Kubernetes cluster containers should only use allowed capabilities

description: Restrict the capabilities to reduce the attack surface of containers in a Kubernetes cluster. This recommendation is part of CIS 5.2.8 and CIS 5.2.9 which are intended to improve the security of your Kubernetes environments. This policy is generally available for Kubernetes Service (AKS), and preview for AKS Engine and Azure Arc enabled Kubernetes. For more information, see https://aka.ms/kubepolicydoc.
- constraint: azurepolicy-container-allowed-capabilities-ac08dde174a3a872b52d

    enforcementAction: deny

    allowedCapabilities:
    - CHOWN
    - DAC_OVERRIDE
    - FSETID
    - FOWNER
    - MKNOD
    - NET_RAW
    - SETGID
    - SETUID
    - SETFCAP
    - SETPCAP
    - NET_BIND_SERVICE
    - SYS_CHROOT
    - KILL
    - AUDIT_WRITE

    kinds:
    - Pod

- constraint: azurepolicy-container-allowed-capabilities-dfbb88a3a471986d512d

    enforcementAction: dryrun

    kinds:
    - Pod

## Allowed Users / Groups
template: **K8sAzureAllowedUsersGroups**

displayName: Kubernetes cluster pods and containers should only run with approved user and group IDs

description: Control the user, primary group, supplemental group and file system group IDs that pods and containers can use to run in a Kubernetes Cluster. This recommendation is part of Pod Security Policies which are intended to improve the security of your Kubernetes environments. This policy is generally available for Kubernetes Service (AKS), and preview for AKS Engine and Azure Arc enabled Kubernetes. For more information, see https://aka.ms/kubepolicydoc.

- constraint: azurepolicy-psp-allowed-users-groups-1ab15f55b750b99cc62f

    enforcementAction: dryrun

    - fsGroup:
      rule: MayRunAs
    - runAsGroup:
      rule: MayRunAs
    - runAsUser:
      rule: MustRunAsNonRoot
    - supplementalGroups:
      rule: MayRunAs

    kinds:
    - Pod

## Block Automount Token
template: **K8sAzureBlockAutomountToken**

displayName: Kubernetes clusters should disable automounting API credentials

description: Disable automounting API credentials to prevent a potentially compromised Pod resource to run API commands against Kubernetes clusters. For more information, see https://aka.ms/kubepolicydoc.

- constraint: azurepolicy-azure-block-automount-ca93c2aa1dcfd5c5dfbc
    enforcementAction: dryrun

    kinds:
    - Pod

## Block Default
template: **K8sAzureBlockDefault**

displayName: Kubernetes clusters should not use the default namespace

description: Prevent usage of the default namespace in Kubernetes clusters to protect against unauthorized access for ConfigMap, Pod, Secret, Service, and ServiceAccount resource types. For more information, see https://aka.ms/kubepolicydoc.

- constraint: azurepolicy-block-default-namespace-5766902fd5fd8cc03052

    enforcementAction: dryrun

    namespaces:
    - default

    kinds:
    - Pod
    - Service
    - ServiceAccount

## Block Host Namespace
template: **K8sAzureBlockHostNamespace**

displayName: Kubernetes cluster containers should not share host process ID or host IPC namespace

description: Block pod containers from sharing the host process ID namespace and host IPC namespace in a Kubernetes cluster. This recommendation is part of CIS 5.2.2 and CIS 5.2.3 which are intended to improve the security of your Kubernetes environments. This policy is generally available for Kubernetes Service (AKS), and preview for AKS Engine and Azure Arc enabled Kubernetes. For more information, see https://aka.ms/kubepolicydoc.

- constraint: azurepolicy-psp-host-namespace-2fa05718db0f9a336bcf

    enforcementAction: deny

    kinds:
    - Pod
    - Service
    - ServiceAccount

- constraint: azurepolicy-psp-host-namespace-83c43bb39141a2819886

    enforcementAction: dryrun

    kinds:
    - Pod

## Container Allowed Images
template: **K8sAzureContainerAllowedImages**

displayName: Kubernetes cluster containers should only use allowed images

description: Use images from trusted registries to reduce the Kubernetes cluster's exposure risk to unknown vulnerabilities, security issues and malicious images. This policy is generally available for Kubernetes Service (AKS), and preview for AKS Engine and Azure Arc enabled Kubernetes. For more information, see https://aka.ms/kubepolicydoc.

- constraint: azurepolicy-container-allowed-images-dda1b6980784c41fc61e

    enforcementAction: dryrun

    imageRegex: ^(.+){0}$

    kinds:
    - Pod

## Container Allowed Ports
template: **K8sAzureContainerAllowedPorts**

displayName: Kubernetes cluster containers should only listen on allowed ports

description: Restrict containers to listen only on allowed ports to secure access to the Kubernetes cluster. This policy is generally available for Kubernetes Service (AKS), and preview for AKS Engine and Azure Arc enabled Kubernetes. For more information, see https://aka.ms/kubepolicydoc.

- constraint: azurepolicy-container-allowed-ports-0f11eaffef35aa801b7d

    enforcementAction: dryrun

    allowedPorts: "-1"

    kinds:
    - Pod

## Container Limits
template: **K8sAzureContainerLimits**

displayName: Kubernetes cluster containers CPU and memory resource limits should not exceed the specified limits

description: Enforce container CPU and memory resource limits to prevent resource exhaustion attacks in a Kubernetes cluster. This policy is generally available for Kubernetes Service (AKS), and preview for AKS Engine and Azure Arc enabled Kubernetes. For more information, see https://aka.ms/kubepolicydoc.

- constraint: azurepolicy-container-limits-22a2f8cd2e871ab9489e

    enforcementAction: dryrun

    cpuLimit: "0"

    memoryLimit: "0"

    kinds:
    - Pod

## Container No Privilege
template: **K8sAzureContainerNoPrivilege**

displayName: Kubernetes cluster should not allow privileged containers

description: Do not allow privileged containers creation in a Kubernetes cluster. This recommendation is part of CIS 5.2.1 which is intended to improve the security of your Kubernetes environments. This policy is generally available for Kubernetes Service (AKS), and preview for AKS Engine and Azure Arc enabled Kubernetes. For more information, see https://aka.ms/kubepolicydoc.

- constraint: azurepolicy-container-no-privilege-8ea2cee21a746099474f

    enforcementAction: deny

    kinds:
    - Pod

- constraint: azurepolicy-container-no-privilege-a595b30e943d2bd6d76a

    enforcementAction: dryrun

    kinds:
    - Pod

## Container No Privilege Escalation
template: K8sAzureContainerNoPrivilegeEscalation

displayName: Kubernetes clusters should not allow container privilege escalation

description: Do not allow containers to run with privilege escalation to root in a Kubernetes cluster. This recommendation is part of CIS 5.2.5 which is intended to improve the security of your Kubernetes environments. This policy is generally available for Kubernetes Service (AKS), and preview for AKS Engine and Azure Arc enabled Kubernetes. For more information, see https://aka.ms/kubepolicydoc.

- constraint: azurepolicy-psp-container-no-privilege-esc-b5dcab851c839497974b

    enforcementAction: dryrun

    kinds:
    - Pod

## Disallowed Capabilities
template: **K8sAzureDisallowedCapabilities**

displayName: Kubernetes clusters should not grant CAP_SYS_ADMIN security capabilities

description: To reduce the attack surface of your containers, restrict CAP_SYS_ADMIN Linux capabilities. For more information, see https://aka.ms/kubepolicydoc.

- constraint: azurepolicy-container-disallowed-capabilit-043475b6642663dfffd0

    enforcementAction: dryrun

    kinds:
    - Pod

## Enforce AppArmor
template: **K8sAzureEnforceAppArmor**

displayName: Kubernetes cluster containers should only use allowed AppArmor profiles

description: Containers should only use allowed AppArmor profiles in a Kubernetes cluster. This recommendation is part of Pod Security Policies which are intended to improve the security of your Kubernetes environments. This policy is generally available for Kubernetes Service (AKS), and preview for AKS Engine and Azure Arc enabled Kubernetes. For more information, see https://aka.ms/kubepolicydoc.

- constraint: azurepolicy-deny-apparmor-profile-ac7e56f6e536110d9662

    enforcementAction: dryrun

    kinds:
    - Pod

## Host Filesystem
template: **K8sAzureHostFilesystem**

displayName: Kubernetes cluster pod hostPath volumes should only use allowed host paths

description: Limit pod HostPath volume mounts to the allowed host paths in a Kubernetes Cluster. This recommendation is part of Pod Security Policies which are intended to improve the security of your Kubernetes environments. This policy is generally available for Kubernetes Service (AKS), and preview for AKS Engine and Azure Arc enabled Kubernetes. For more information, see https://aka.ms/kubepolicydoc.

- constraint: azurepolicy-psp-host-filesystem-8504a812aa76228736df

    enforcementAction: dryrun

    kinds:
    - Pod

## Host Networking Ports
template: **K8sAzureHostNetworkingPorts**

displayName: Kubernetes cluster pods should only use approved host network and port range

description: Restrict pod access to the host network and the allowable host port range in a Kubernetes cluster. This recommendation is part of CIS 5.2.4 which is intended to improve the security of your Kubernetes environments. This policy is generally available for Kubernetes Service (AKS), and preview for AKS Engine and Azure Arc enabled Kubernetes. For more information, see https://aka.ms/kubepolicydoc.

- constraint: azurepolicy-psp-host-network-ports-29735c1db979997ac4f1

    enforcementAction: deny

    allowHostNetwork: false

    maxPort: 0

    minPort: 0

    kinds:
    - Pod

- constraint: azurepolicy-psp-host-network-ports-d5a6f2624f1567e1b174

    enforcementAction: dryrun

    allowHostNetwork: false

    maxPort: 0

    minPort: 0

    kinds:
    - Pod

## Ingress Https Only
template: **K8sAzureIngressHttpsOnly**

displayName: Kubernetes clusters should be accessible only over HTTPS

description: Use of HTTPS ensures authentication and protects data in transit from network layer eavesdropping attacks. This capability is currently generally available for Kubernetes Service (AKS), and in preview for AKS Engine and Azure Arc enabled Kubernetes. For more info, visit https://aka.ms/kubepolicydoc

- constraint: azurepolicy-ingress-https-only-9178d10aa9ee797b6cc6

    enforcementAction: deny

    kinds:
    - apiGroups:
      - extensions
      - networking.k8s.io
    
    kinds:
    - Ingress

- constraint: azurepolicy-ingress-https-only-bc0228ed8d1069ddc2e1

    enforcementAction: dryrun

    kinds:
    - apiGroups:
      - extensions
      - networking.k8s.io
    
    kinds:
     - Ingress


## Load Balancer No Public IPs
template: **K8sAzureLoadBalancerNoPublicIPs**

displayName: Kubernetes clusters should use internal load balancers

description: Use internal load balancers to make a Kubernetes service accessible only to applications running in the same virtual network as the Kubernetes cluster. For more information, see https://aka.ms/kubepolicydoc.

- constraint: azurepolicy-load-balancer-no-public-ips-2ff46f0d7700cabade18

    enforcementAction: deny

    kinds:
    - Service


## ReadOnly Root Filesystem
template: **K8sAzureReadOnlyRootFilesystem**

displayName: Kubernetes cluster containers should run with a read only root file system

description: Run containers with a read only root file system to protect from changes at run-time with malicious binaries being added to PATH in a Kubernetes cluster. This policy is generally available for Kubernetes Service (AKS), and preview for AKS Engine and Azure Arc enabled Kubernetes. For more information, see https://aka.ms/kubepolicydoc.

- constraint: azurepolicy-psp-readonly-root-filesystem-10b38727c6dc374aa685

    enforcementAction: dryrun

    kinds:
    - Pod

## Service Allowed Ports
template: **K8sAzureServiceAllowedPorts**

displayName: Kubernetes cluster services should listen only on allowed ports

description: Restrict services to listen only on allowed ports to secure access to the Kubernetes cluster. This policy is generally available for Kubernetes Service (AKS), and preview for AKS Engine and Azure Arc enabled Kubernetes. For more information, see https://aka.ms/kubepolicydoc.

- constraint: azurepolicy-service-allowed-ports-9a8a23c7a584f0401148

    enforcementAction: dryrun

    kinds:
    - Service

## Volume Types
template: **K8sAzureVolumeTypes**

displayName: 

description: 

- constraint: azurepolicy-psp-volume-types-f4c42ab9e8b9603c31a1

    enforcementAction: deny

    kinds:
    - Pod

    volumes:
    - configMap
    - emptyDir
    - projected
    - secret
    - downwardAPI
    - persistentVolumeClaim
