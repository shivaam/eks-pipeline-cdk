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


### Steps to build and deploy
1. `npm install`
2. `npm run build`
3. Create a secret `github-token`
```
aws secretsmanager create-secret \
    --name github-token \
    --secret-string <secret enter here> \
    --region us-east-1
```
4. If there are multiple regions, replicate the token across all AWS regions
```
aws secretsmanager replicate-secret-to-regions \
    --secret-id github-token \
    --add-replica-regions Region=us-west-2 Region=us-east-2 \
    --region us-east-1
```
5. Add github ssh key for ArgoCD to poll the repo.
Generate the ssh key using below command and add it to your github account. Check the name of the key to be `argocd_ed25519`
```
ssh-keygen -t ed25519 -C "argoCD ssh key"                        
gh auth login 
gh ssh-key add ~/.ssh/argocd_ed25519.pub --title "ArgoCD SSH Key"

```
Generate the secrets JSON using  `./scripts/create-argocd-ssh-secret.sh`. It will output the following json. 

```
secrets.json
{
  "sshPrivateKey": "-----BEGIN OPENSSH PRIVATE KEY-----XXXX----END OPENSSH PRIVATE KEY-----\n",
  "url": "git@github"
} 
save to secret.json and run the following command to create the secret. 

aws secretsmanager create-secret --name github-ssh-key --secret-string file://secret.json --region <Your-Default-Region>
```
6. Bootstrap the environment if you are deploying the cdk app for the first time
`cdk bootstrap`

7. List the cdk stacks.
8. Deploy the stacks. 
` cdk deploy pipelienstack` The cluster stack will be deployed by the code in the github repositories so we dont have to deploy that. 


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





Follow two tutorials together :
https://aws-quickstart.github.io/cdk-eks-blueprints/getting-started/
https://catalog.workshops.aws/eks-blueprints-for-cdk/en-US/040-multiple-clusters-pipelines/043-addons/1-introducing-add-ons
