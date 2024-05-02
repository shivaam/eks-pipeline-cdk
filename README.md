# Welcome to your CDK TypeScript project

Create an EKS cluster in AWS account with built in best practices like:
- Waves for different stages beta, gamma, prod
- Secure access using roles,
- AddOns including EBS volume, kube-proxy

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests

* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template


## Steps to build and deploy
1. `npm install`
1. `npm run build`
1. Create a secret `github-token`
   ```
    aws secretsmanager create-secret \
        --name github-token \
        --secret-string <secret enter here> \
        --region us-east-1
    ```
1. If there are multiple regions, replicate the token across all AWS regions
    ```
    aws secretsmanager replicate-secret-to-regions \
        --secret-id github-token \
        --add-replica-regions Region=us-west-2 Region=us-east-2 \
        --region us-east-1
    ```


1. Bootstrap the environment if you are deploying the cdk app for the first time
`cdk bootstrap`

1. List the cdk stacks. `cdk list`

1. Deploy the pipeline stack only. `cdk deploy pipeline-stack`
    Note: The cluster stack will be deployed by the code in the github repositories so we dont have to deploy that. 

(Optional Steps)

1. Add github ssh key for ArgoCD to poll the repo.
    Generate the ssh key using below command and add it to your github account. Check the name of the key to be `argocd_ed25519`
      ```
      ssh-keygen -t ed25519 -C "argoCD ssh key"                        
      gh auth login 
      gh ssh-key add ~/.ssh/argocd_ed25519.pub --title "ArgoCD SSH Key"

      ```
1. Generate the secrets JSON using  `./scripts/create-argocd-ssh-secret.sh`. It will output the following json. 

      ```
      secrets.json
      {
        "sshPrivateKey": "-----BEGIN OPENSSH PRIVATE KEY-----XXXX----END OPENSSH PRIVATE KEY-----\n",
        "url": "git@github"
      } 
      ```
1. Save to secret.json and run the following command to create the secret. 
    ```
    aws secretsmanager create-secret --name github-ssh-key --secret-string file://secret.json --region <Your-Default-Region>
    ```
### Argocd setup
- allow argocd access via https:
kubectl patch configmap argocd-cm -n argocd --type merge -p '{"data":{"tls.insecure":"true"}}'
- allow ssl passthtrough in nginx
  ```
  kubectl patch deployment blueprints-addon-nginx-nginx-ingress-controller -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--enable-ssl-passthrough"}]'

  kubectl rollout undo deployment blueprints-addon-nginx-nginx-ingress-controller -n kube-system 

  kubectl edit deployment blueprints-addon-nginx-nginx-ingress-controller
  kubectl get configmap blueprints-addon-nginx-nginx-ingress -o yaml
  ```


## Troubleshooting
- Delete a secret from secretsmanager
`aws secretsmanager delete-secret --secret-id github-token --force-delete-without-recovery --region us-east-1`

- Test a github secret is vaild or not
`curl -v -H "Authorization: token <secret>" https://api.github.com/user/issues`


#### Follow two tutorials together :
https://aws-quickstart.github.io/cdk-eks-blueprints/getting-started/
https://catalog.workshops.aws/eks-blueprints-for-cdk/en-US/040-multiple-clusters-pipelines/043-addons/1-introducing-add-ons
