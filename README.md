# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template


Follow two tutorials together :
https://aws-quickstart.github.io/cdk-eks-blueprints/getting-started/
https://catalog.workshops.aws/eks-blueprints-for-cdk/en-US/040-multiple-clusters-pipelines/043-addons/1-introducing-add-ons


Step 6. Secrets manager token
Create the aws secrets token using this command
```
aws secretsmanager create-secret \
    --name github-token \
    --secret-string 'secret enter here' \
    --region us-east-1

```
Replicate the token across the envirnoment
```
aws secretsmanager replicate-secret-to-regions \
    --secret-id github-token \
    --add-replica-regions Region=us-west-2 Region=us-east-2 \
    --region us-east-1
```

Step 7.
Add github ssh key for ArgoCD to poll the repo.

```
ssh-keygen -t ed25519 -C "argoCD ssh key"                        
gh auth login 
gh ssh-key add ~/.ssh/argocd_ed25519.pub --title "ArgoCD SSH Key"

```


Step 8.

Generate the secrets file using 
./secret/create-argocd-ssh-secret.sh

```
secrets.json
{
  "sshPrivateKey": "-----BEGIN OPENSSH PRIVATE KEY-----XXXX----END OPENSSH PRIVATE KEY-----\n",
  "url": "git@github"
}

aws secretsmanager create-secret --name github-ssh-key --secret-string file://secret.json --region <Your-Default-Region>

```


Step 10. 

` cdk build ` - Converts the typescript code to js code and stores in the dis directory.

Check the cloudformation outputs for the command to get the kubectl configuration. 


#### Argocd setup
- allow insecure argocd
kubectl patch configmap argocd-cm -n argocd --type merge -p '{"data":{"tls.insecure":"true"}}'
- allow ssl pathtoruh in nfinx
```
kubectl patch deployment blueprints-addon-nginx-nginx-ingress-controller -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--enable-ssl-passthrough"}]'

kubectl rollout undo deployment blueprints-addon-nginx-nginx-ingress-controller -n kube-system 

kubectl edit deployment blueprints-addon-nginx-nginx-ingress-controller
kubectl get configmap blueprints-addon-nginx-nginx-ingress -o yaml

```

