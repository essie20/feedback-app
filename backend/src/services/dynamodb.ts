import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand,
    ScanCommand,
    CreateTableCommand
} from '@aws-sdk/lib-dynamodb';

export interface FeedbackItem {
    id: string;
    text: string;
    category: string;
    createdAt: string;
}

// DynamoDB client configuration
const client = new DynamoDBClient({
    endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:4566',
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test'
    }
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'feedback';

// In-memory fallback storage when DynamoDB is unavailable
let inMemoryStorage: FeedbackItem[] = [];
let usingFallback = false;

/**
 * Initialize the DynamoDB table (for LocalStack)
 */
export async function initializeTable(): Promise<void> {
    try {
        const { CreateTableCommand: CreateTableCmd } = await import('@aws-sdk/client-dynamodb');

        await client.send(new CreateTableCmd({
            TableName: TABLE_NAME,
            KeySchema: [
                { AttributeName: 'id', KeyType: 'HASH' }
            ],
            AttributeDefinitions: [
                { AttributeName: 'id', AttributeType: 'S' }
            ],
            BillingMode: 'PAY_PER_REQUEST'
        }));

        console.log(`✅ Created DynamoDB table: ${TABLE_NAME}`);
    } catch (error: any) {
        if (error.name === 'ResourceInUseException') {
            console.log(`📦 DynamoDB table already exists: ${TABLE_NAME}`);
        } else {
            console.error('⚠️ Could not create DynamoDB table:', error.message);
            console.log('📝 Using in-memory storage as fallback');
            usingFallback = true;
        }
    }
}

/**
 * Save a feedback item to DynamoDB or fallback storage
 */
export async function saveFeedback(item: FeedbackItem): Promise<void> {
    if (usingFallback) {
        inMemoryStorage.unshift(item);
        return;
    }

    try {
        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: item
        }));
    } catch (error: any) {
        console.error('⚠️ DynamoDB save failed, using fallback:', error.message);
        usingFallback = true;
        inMemoryStorage.unshift(item);
    }
}

/**
 * Retrieve all feedback items
 */
export async function getAllFeedback(): Promise<FeedbackItem[]> {
    if (usingFallback) {
        return inMemoryStorage;
    }

    try {
        const result = await docClient.send(new ScanCommand({
            TableName: TABLE_NAME
        }));

        const items = (result.Items || []) as FeedbackItem[];
        // Sort by createdAt descending
        return items.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    } catch (error: any) {
        console.error('⚠️ DynamoDB fetch failed, using fallback:', error.message);
        usingFallback = true;
        return inMemoryStorage;
    }
}

/**
 * Get feedback statistics
 */
export async function getFeedbackStats(): Promise<{
    total: number;
    byCategory: Record<string, number>;
}> {
    const feedbacks = await getAllFeedback();

    const byCategory = feedbacks.reduce((acc, fb) => {
        acc[fb.category] = (acc[fb.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        total: feedbacks.length,
        byCategory
    };
}

// Initialize table on module load
initializeTable();
