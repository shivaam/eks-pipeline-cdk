import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import "reflect-metadata";


const CDK_REPO_NAME = 'eks-pipeline-cdk';
const GIT_SECRET_NAME = 'github-token';
const EKS_CLUSTER_NAME = 'eks-babblebox';
const PIPELINE_NAME = 'eks-pipeline';

export default class PipelineConstruct extends Construct {
  constructor(scope: Construct, id: string, props?: cdk.StackProps){
    super(scope, id)

    const account = props?.env?.account!;
    const region = props?.env?.region!;
    
    this.validateGithubSecret();

    const awsPcaParams = {
        iamPolicies: ["AWSCertificateManagerPrivateCAFullAccess"]
      }
      const addOn = new blueprints.addons.AWSPrivateCAIssuerAddon(awsPcaParams)

        // commonly configured addons
    const addons: blueprints.ClusterAddOn[] = [
        new blueprints.addons.AwsLoadBalancerControllerAddOn(),
        new blueprints.addons.SecretsStoreAddOn(),
        new blueprints.addons.EbsCsiDriverAddOn({
          version: "auto",
        }),
        new blueprints.addons.NginxAddOn(),
    ];
    Reflect.defineMetadata("ordered", true, addons[0]); // repeat for all addons
    Reflect.defineMetadata("ordered", true, addons[1]); // repeat for all addons
    Reflect.defineMetadata("ordered", true, addons[2]); // repeat for all addons
    Reflect.defineMetadata("ordered", true, addons[3]); // repeat for all addons


    const blueprint = blueprints.EksBlueprint.builder()
    .version('auto')
    .account(account)
    .region(region)
    .addOns(...addons)
    .name(EKS_CLUSTER_NAME)
    .teams();
  
    blueprints.CodePipelineStack.builder()
      .name(PIPELINE_NAME)
      .codeBuildPolicies(blueprints.DEFAULT_BUILD_POLICIES)
      .owner('shivaam')
      .repository({
        repoUrl: CDK_REPO_NAME,
        credentialsSecretName: GIT_SECRET_NAME,
        targetRevision: 'master',
    })
    .wave({
        id: "envs",
        stages: [
          { id: "prod", stackBuilder: blueprint.clone('us-east-1')}
        ]
      })
      .build(scope, id+'-stack', props);
  }

  
  // Check if a secret called githb-token exists in the AWS Secrets Manager before deploying this stack
  private validateGithubSecret(){
    const secret = cdk.SecretValue.secretsManager(GIT_SECRET_NAME);
    if (secret == null){
      throw new Error(`Secret with name ${GIT_SECRET_NAME} not found in AWS Secrets Manager`);
    }
  }
}



