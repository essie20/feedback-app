import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

export class FeedbackStack extends cdk.Stack {
    public readonly feedbackTable: dynamodb.Table;
    public readonly websiteBucket: s3.Bucket;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // ========================================
        // DynamoDB Table for storing feedback
        // ========================================
        this.feedbackTable = new dynamodb.Table(this, 'FeedbackTable', {
            tableName: 'feedback',
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING,
            },
            // Enable Time-to-Live for automatic cleanup (optional)
            timeToLiveAttribute: 'ttl',

            // Use on-demand billing for unpredictable workloads
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,

            // DESTROY for development - change to RETAIN for production!
            removalPolicy: cdk.RemovalPolicy.DESTROY,

            // Enable point-in-time recovery for production
            pointInTimeRecovery: false, // Set to true for production
        });

        // Add Global Secondary Index for querying by category
        this.feedbackTable.addGlobalSecondaryIndex({
            indexName: 'category-index',
            partitionKey: {
                name: 'category',
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: 'createdAt',
                type: dynamodb.AttributeType.STRING,
            },
            projectionType: dynamodb.ProjectionType.ALL,
        });

        // ========================================
        // S3 Bucket for static website hosting
        // ========================================
        this.websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
            bucketName: `feedback-app-website-${this.account}`,
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html', // For SPA routing
            publicReadAccess: true,
            blockPublicAccess: new s3.BlockPublicAccess({
                blockPublicAcls: false,
                ignorePublicAcls: false,
                blockPublicPolicy: false,
                restrictPublicBuckets: false,
            }),
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true, // Clean up on stack deletion
            cors: [
                {
                    allowedHeaders: ['*'],
                    allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
                    allowedOrigins: ['*'],
                    maxAge: 3600,
                },
            ],
        });

        // ========================================
        // Outputs
        // ========================================
        new cdk.CfnOutput(this, 'FeedbackTableName', {
            value: this.feedbackTable.tableName,
            description: 'Name of the DynamoDB feedback table',
            exportName: 'FeedbackTableName',
        });

        new cdk.CfnOutput(this, 'FeedbackTableArn', {
            value: this.feedbackTable.tableArn,
            description: 'ARN of the DynamoDB feedback table',
            exportName: 'FeedbackTableArn',
        });

        new cdk.CfnOutput(this, 'WebsiteBucketName', {
            value: this.websiteBucket.bucketName,
            description: 'Name of the S3 website bucket',
            exportName: 'WebsiteBucketName',
        });

        new cdk.CfnOutput(this, 'WebsiteUrl', {
            value: this.websiteBucket.bucketWebsiteUrl,
            description: 'URL of the hosted website',
            exportName: 'WebsiteUrl',
        });
    }
}
