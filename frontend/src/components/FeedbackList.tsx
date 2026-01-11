import type { Feedback } from '../App';
import './FeedbackList.css';

interface Props {
    feedbacks: Feedback[];
}

export default function FeedbackList({ feedbacks }: Props) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="feedback-list" role="feed" aria-label="Feedback list">
            <div className="list-header">
                <h2>Recent Feedback</h2>
                <span className="feedback-count">{feedbacks.length} items</span>
            </div>

            <div className="feedback-items">
                {feedbacks.map((feedback, index) => (
                    <article
                        key={feedback.id}
                        className="feedback-card animate-slideIn"
                        style={{ animationDelay: `${index * 50}ms` }}
                        aria-label={`Feedback: ${feedback.category}`}
                    >
                        <div className="card-header">
                            <span className="category-badge">{feedback.category}</span>
                            <time
                                className="timestamp"
                                dateTime={feedback.createdAt}
                                title={new Date(feedback.createdAt).toLocaleString()}
                            >
                                {formatDate(feedback.createdAt)}
                            </time>
                        </div>

                        <p className="feedback-text">{feedback.text}</p>

                        <div className="card-footer">
                            <span className="feedback-id">#{feedback.id.slice(0, 8)}</span>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
