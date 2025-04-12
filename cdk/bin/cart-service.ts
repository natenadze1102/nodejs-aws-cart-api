#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CartServiceStack } from '../lib/cart-service-stack';

const app = new cdk.App();
new CartServiceStack(app, 'CartServiceStack', {
  env: {
    account: '595131344444',
    region: 'eu-central-1',
  },
  description: 'Cart Service with PostgreSQL database',
});
