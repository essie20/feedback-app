import { Router, Request, Response } from 'express';
import { saveFeedback, getAllFeedback, getFeedbackStats } from '../services/dynamodb.js';
import { categorizeFeedback } from '../services/gemini.js';
import { v4 as uuid } from 'uuid';

const router = Router();

// POST /api/feedback - Submit new feedback
router.post('/', async (req: Request, res: Response) => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            res.status(400).json({ error: 'Feedback text is required' });
            return;
        }

        if (text.length > 1000) {
            res.status(400).json({ error: 'Feedback must be under 1000 characters' });
            return;
        }

        console.log('📝 Processing feedback:', text.substring(0, 50) + '...');

        // Use AI to categorize the feedback
        const category = await categorizeFeedback(text);
        console.log('🏷️ Category:', category);

        const feedbackItem = {
            id: uuid(),
            text: text.trim(),
            category,
            createdAt: new Date().toISOString()
        };

        await saveFeedback(feedbackItem);
        console.log('✅ Feedback saved:', feedbackItem.id);

        res.status(201).json(feedbackItem);
    } catch (error) {
        console.error('❌ Error saving feedback:', error);
        res.status(500).json({ error: 'Failed to save feedback' });
    }
});

// GET /api/feedback - Get all feedback
router.get('/', async (req: Request, res: Response) => {
    try {
        const feedbacks = await getAllFeedback();
        res.json(feedbacks);
    } catch (error) {
        console.error('❌ Error fetching feedback:', error);
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
});

// GET /api/feedback/stats - Get feedback statistics
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const stats = await getFeedbackStats();
        res.json(stats);
    } catch (error) {
        console.error('❌ Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

export default router;
