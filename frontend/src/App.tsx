import { useState, useEffect, useCallback } from 'react';
import FeedbackForm from './components/FeedbackForm';
import FeedbackList from './components/FeedbackList';
import Stats from './components/Stats';
import Header from './components/Header';
import './App.css';

export interface Feedback {
    id: string;
    text: string;
    category: string;
    createdAt: string;
}

export interface FeedbackStats {
    total: number;
    byCategory: Record<string, number>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [stats, setStats] = useState<FeedbackStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFeedbacks = useCallback(async () => {
        try {
            setError(null);
            const [feedbackRes, statsRes] = await Promise.all([
                fetch(`${API_BASE}/api/feedback`),
                fetch(`${API_BASE}/api/feedback/stats`)
            ]);

            if (!feedbackRes.ok) throw new Error('Failed to fetch feedbacks');
            if (!statsRes.ok) throw new Error('Failed to fetch stats');

            const feedbackData = await feedbackRes.json();
            const statsData = await statsRes.json();

            setFeedbacks(feedbackData);
            setStats(statsData);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Unable to connect to the server. Make sure the backend is running on port 3001.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFeedbacks();
    }, [fetchFeedbacks]);

    const handleSubmit = async (text: string): Promise<boolean> => {
        try {
            setError(null);
            const res = await fetch(`${API_BASE}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to submit feedback');
            }

            const newFeedback = await res.json();
            setFeedbacks(prev => [newFeedback, ...prev]);

            // Update stats
            setStats(prev => {
                if (!prev) return { total: 1, byCategory: { [newFeedback.category]: 1 } };
                return {
                    total: prev.total + 1,
                    byCategory: {
                        ...prev.byCategory,
                        [newFeedback.category]: (prev.byCategory[newFeedback.category] || 0) + 1
                    }
                };
            });

            return true;
        } catch (err) {
            console.error('Error submitting feedback:', err);
            setError(err instanceof Error ? err.message : 'Failed to submit feedback');
            return false;
        }
    };

    return (
        <div className="app">
            <Header />

            <main className="main-content">
                <div className="container">
                    {error && (
                        <div className="error-banner animate-fadeIn">
                            <span className="error-icon">⚠️</span>
                            <span>{error}</span>
                            <button
                                className="error-dismiss"
                                onClick={() => setError(null)}
                                aria-label="Dismiss error"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    <section className="form-section">
                        <FeedbackForm onSubmit={handleSubmit} disabled={loading} />
                    </section>

                    {stats && stats.total > 0 && (
                        <section className="stats-section animate-fadeIn">
                            <Stats stats={stats} />
                        </section>
                    )}

                    <section className="list-section">
                        {loading ? (
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                <p>Loading feedback...</p>
                            </div>
                        ) : feedbacks.length === 0 ? (
                            <div className="empty-state animate-fadeIn">
                                <span className="empty-icon">💭</span>
                                <h3>No feedback yet</h3>
                                <p>Be the first to share your thoughts!</p>
                            </div>
                        ) : (
                            <FeedbackList feedbacks={feedbacks} />
                        )}
                    </section>
                </div>
            </main>

            <footer className="footer">
                <div className="container">
                    <p>
                        Built with ❤️ using React, Node.js, and AI •
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer"> View on GitHub</a>
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default App;
