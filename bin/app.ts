#!/usr/bin/env node
import 'dotenv/config';
import * as cdk from 'aws-cdk-lib';

import { IfkpassApiStack } from '../lib/ifkpass-api-stack';

const app = new cdk.App();

new IfkpassApiStack(app, 'IfkpassApiStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT ?? process.env.ACCOUNT_ID,
    region: process.env.CDK_DEFAULT_REGION ?? process.env.REGION ?? 'us-east-1'
  }
});
