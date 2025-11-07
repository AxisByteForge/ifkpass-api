#!/usr/bin/env node
import 'dotenv/config';
import * as cdk from 'aws-cdk-lib';

import { IfkpassBackendStack } from '../lib/ifkpass-backend-stack';

const app = new cdk.App();
const stage =
  (app.node.tryGetContext('stage') as string | undefined) ??
  process.env.STAGE ??
  'dev';

new IfkpassBackendStack(app, 'IfkpassBackendStack', {
  stage,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT ?? process.env.ACCOUNT_ID,
    region: process.env.CDK_DEFAULT_REGION ?? process.env.REGION ?? 'us-east-1',
  },
});
