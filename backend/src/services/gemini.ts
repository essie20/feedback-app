import { GoogleGenerativeAI } from '@google/generative-ai';

// Lazy initialization for Gemini AI
let genAI: GoogleGenerativeAI | null = null;
let initialized = false;

function getGeminiClient(): GoogleGenerativeAI | null {
    if (initialized) return genAI;
    initialized = true;

    const apiKey = process.env.GEMINI_API_KEY || '';
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

    if (apiKey && apiKey !== 'demo-key') {
        genAI = new GoogleGenerativeAI(apiKey);
        console.log(`🤖 Gemini AI initialized with model: ${modelName}`);
    } else {
        console.log('⚠️ No Gemini API key found, using rule-based categorization');
    }
    return genAI;
}

/**
 * Category definitions with emojis
 */
const CATEGORIES = {
    BUG: '🐛 Bug Report',
    FEATURE: '✨ Feature Request',
    PRAISE: '🌟 Praise',
    COMPLAINT: '😞 Complaint',
    QUESTION: '❓ Question',
    GENERAL: '💬 General Feedback'
} as const;

/**
 * Rule-based categorization fallback
 */
function ruleBasedCategorize(text: string): string {
    const lowerText = text.toLowerCase();

    // Bug indicators (allow word stems like crash/crashes/crashing)
    if (lowerText.match(/\b(bug|error|crash|broken|doesn't work|not working|issue|problem|fix)\w*/)) {
        return CATEGORIES.BUG;
    }

    // Feature request indicators
    if (lowerText.match(/\b(feature|add|would be nice|could you|can you|please add|want|wish|suggest|idea)\w*/)) {
        return CATEGORIES.FEATURE;
    }

    // Praise indicators
    if (lowerText.match(/\b(love|great|awesome|amazing|excellent|fantastic|wonderful|best|thank|good job|well done)\w*/)) {
        return CATEGORIES.PRAISE;
    }

    // Complaint indicators (allow word stems like frustrat/frustrated/frustrating)
    if (lowerText.match(/\b(hate|terrible|awful|worst|disappoint|frustrat|annoy|bad|poor|useless)\w*/)) {
        return CATEGORIES.COMPLAINT;
    }

    // Question indicators
    if (lowerText.match(/\?$/) || lowerText.match(/\b(how|what|why|when|where|who|can i|is it)\b/)) {
        return CATEGORIES.QUESTION;
    }

    return CATEGORIES.GENERAL;
}

/**
 * Categorize feedback using Gemini AI with fallback to rule-based approach
 */
export async function categorizeFeedback(text: string): Promise<string> {
    const client = getGeminiClient();

    // Use rule-based categorization if no API key
    if (!client) {
        return ruleBasedCategorize(text);
    }

    try {
        const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
        const model = client.getGenerativeModel({ model: modelName });

        const prompt = `You are a feedback categorization assistant. Analyze the following feedback and categorize it into exactly ONE of these categories. Respond with ONLY the category name and its emoji, nothing else.

Categories:
- 🐛 Bug Report (for technical issues, errors, things not working)
- ✨ Feature Request (for new feature suggestions or improvements)
- 🌟 Praise (for positive feedback, compliments, appreciation)
- 😞 Complaint (for negative experiences, dissatisfaction)
- ❓ Question (for questions or requests for information)
- 💬 General Feedback (for anything that doesn't fit above)

Feedback: "${text}"

Category:`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const responseText = response.text().trim();

        // Validate the response contains one of our categories
        const validCategories = Object.values(CATEGORIES);
        const matchedCategory = validCategories.find(cat =>
            responseText.includes(cat) || responseText.includes(cat.substring(2))
        );

        return matchedCategory || responseText || CATEGORIES.GENERAL;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('⚠️ Gemini API error, falling back to rule-based:', message);
        return ruleBasedCategorize(text);
    }
}

export { CATEGORIES };
