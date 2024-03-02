import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import * as cpactions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as directoryservice from 'aws-cdk-lib/aws-directoryservice';


const GITHUB_ORG = 'shivaam';
const CLUSTER_VERSION = eks.KubernetesVersion.V1_26;
const CDK_REPO_NAME = 'eks-pipeline-cdk';
const GIT_SECRET_NAME = 'github-token';


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
        new blueprints.addons.CertManagerAddOn(),
        new blueprints.addons.SecretsStoreAddOn(),
        new blueprints.addons.MetricsServerAddOn(),
        new blueprints.addons.EbsCsiDriverAddOn(),
        new blueprints.addons.ArgoCDAddOn(),
        new blueprints.addons.CoreDnsAddOn(),
        new blueprints.addons.ClusterAutoScalerAddOn(),
        new blueprints.addons.VpcCniAddOn(),
        new blueprints.addons.KubeProxyAddOn(),
        new blueprints.addons.NginxAddOn(),
        new blueprints.addons.AWSPrivateCAIssuerAddon(awsPcaParams),
    ];

    const blueprint = blueprints.EksBlueprint.builder()
    .version('auto')
    .account(account)
    .region(region)
    .addOns(...addons)
    .teams();
  
    blueprints.CodePipelineStack.builder()
      .name("eks-blueprints-workshop-pipeline")
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



