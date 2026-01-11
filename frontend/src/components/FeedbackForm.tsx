import { useState } from 'react';
import './FeedbackForm.css';

interface Props {
    onSubmit: (text: string) => Promise<boolean>;
    disabled?: boolean;
}

export default function FeedbackForm({ onSubmit, disabled }: Props) {
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [charCount, setCharCount] = useState(0);

    const MAX_CHARS = 1000;

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length <= MAX_CHARS) {
            setText(value);
            setCharCount(value.length);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || submitting || disabled) return;

        setSubmitting(true);
        const success = await onSubmit(text);

        if (success) {
            setText('');
            setCharCount(0);
        }
        setSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="feedback-form" id="feedback-form">
            <div className="form-header">
                <h2>Share Your Feedback</h2>
                <p>Your feedback helps us improve! AI will automatically categorize it.</p>
            </div>

            <div className="textarea-wrapper">
                <textarea
                    id="feedback-text"
                    value={text}
                    onChange={handleTextChange}
                    placeholder="What's on your mind? Report a bug, request a feature, or share your thoughts..."
                    rows={5}
                    disabled={submitting || disabled}
                    aria-label="Feedback text"
                    aria-describedby="char-count"
                />
                <div className="textarea-footer">
                    <span
                        id="char-count"
                        className={`char-count ${charCount > MAX_CHARS * 0.9 ? 'warning' : ''}`}
                    >
                        {charCount}/{MAX_CHARS}
                    </span>
                </div>
            </div>

            <button
                type="submit"
                className="submit-button"
                disabled={!text.trim() || submitting || disabled}
                id="submit-feedback"
            >
                {submitting ? (
                    <>
                        <span className="button-spinner"></span>
                        <span>Analyzing with AI...</span>
                    </>
                ) : (
                    <>
                        <span className="button-icon">✨</span>
                        <span>Submit Feedback</span>
                    </>
                )}
            </button>

            <div className="form-hint">
                <span>💡</span>
                <span>
                    Try including words like "bug", "feature", "love", or "hate" to see AI categorization in action!
                </span>
            </div>
        </form>
    );
}
