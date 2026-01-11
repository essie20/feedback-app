#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FeedbackStack } from '../lib/feedback-stack';

const app = new cdk.App();

new FeedbackStack(app, 'FeedbackStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT || '000000000000',
        region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
    },
    description: 'AI-Powered Feedback Collector Infrastructure',
});

app.synth();
