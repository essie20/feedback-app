import { describe, it, expect, vi, beforeEach } from 'vitest';
import { categorizeFeedback, CATEGORIES } from '../services/gemini.js';

// Mock the GoogleGenerativeAI module
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: vi.fn().mockImplementation(() => null)
}));

describe('Feedback Categorization (Rule-based fallback)', () => {
    describe('Bug Report Detection', () => {
        it('categorizes "bug" mentions as Bug Report', async () => {
            const result = await categorizeFeedback('There is a bug in the login page');
            expect(result).toBe(CATEGORIES.BUG);
        });

        it('categorizes "error" mentions as Bug Report', async () => {
            const result = await categorizeFeedback('I get an error when I try to submit');
            expect(result).toBe(CATEGORIES.BUG);
        });

        it('categorizes "not working" as Bug Report', async () => {
            const result = await categorizeFeedback('The button is not working');
            expect(result).toBe(CATEGORIES.BUG);
        });

        it('categorizes "crash" as Bug Report', async () => {
            const result = await categorizeFeedback('The app crashes every time I use it');
            expect(result).toBe(CATEGORIES.BUG);
        });
    });

    describe('Feature Request Detection', () => {
        it('categorizes "feature" mentions as Feature Request', async () => {
            const result = await categorizeFeedback('Can you add a dark mode feature?');
            expect(result).toBe(CATEGORIES.FEATURE);
        });

        it('categorizes "would be nice" as Feature Request', async () => {
            const result = await categorizeFeedback('It would be nice to have notifications');
            expect(result).toBe(CATEGORIES.FEATURE);
        });

        it('categorizes suggestions as Feature Request', async () => {
            const result = await categorizeFeedback('I suggest adding export functionality');
            expect(result).toBe(CATEGORIES.FEATURE);
        });
    });

    describe('Praise Detection', () => {
        it('categorizes "love" as Praise', async () => {
            const result = await categorizeFeedback('I love this app!');
            expect(result).toBe(CATEGORIES.PRAISE);
        });

        it('categorizes "great" as Praise', async () => {
            const result = await categorizeFeedback('Great work on the new design');
            expect(result).toBe(CATEGORIES.PRAISE);
        });

        it('categorizes "amazing" as Praise', async () => {
            const result = await categorizeFeedback('This is amazing!');
            expect(result).toBe(CATEGORIES.PRAISE);
        });
    });

    describe('Complaint Detection', () => {
        it('categorizes "hate" as Complaint', async () => {
            const result = await categorizeFeedback('I hate how slow it is');
            expect(result).toBe(CATEGORIES.COMPLAINT);
        });

        it('categorizes "terrible" as Complaint', async () => {
            const result = await categorizeFeedback('The service is terrible');
            expect(result).toBe(CATEGORIES.COMPLAINT);
        });

        it('categorizes "frustrated" as Complaint', async () => {
            const result = await categorizeFeedback('So frustrated with this app');
            expect(result).toBe(CATEGORIES.COMPLAINT);
        });
    });

    describe('Question Detection', () => {
        it('categorizes questions ending with ? as Question', async () => {
            const result = await categorizeFeedback('How do I reset my password?');
            expect(result).toBe(CATEGORIES.QUESTION);
        });

        it('categorizes "how to" as Question', async () => {
            const result = await categorizeFeedback('How to delete my account');
            expect(result).toBe(CATEGORIES.QUESTION);
        });
    });

    describe('General Feedback Detection', () => {
        it('categorizes neutral feedback as General', async () => {
            const result = await categorizeFeedback('The app has a blue theme');
            expect(result).toBe(CATEGORIES.GENERAL);
        });

        it('categorizes ambiguous feedback as General', async () => {
            const result = await categorizeFeedback('Interesting approach');
            expect(result).toBe(CATEGORIES.GENERAL);
        });
    });
});
