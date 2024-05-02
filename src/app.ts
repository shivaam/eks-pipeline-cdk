#!/usr/bin/env node
import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';
import PipelineConstruct from './stack/eks-pipeline-stack';

const app = new cdk.App();
const account = process.env.CDK_DEFAULT_ACCOUNT!;
const region = process.env.CDK_DEFAULT_REGION!;
console.log(`account: ${account}, region: ${region}`);
const env = { account, region }

new PipelineConstruct(app, 'eks-pipeline', { env });