import type { FeedbackStats } from '../App';
import './Stats.css';

interface Props {
    stats: FeedbackStats;
}

export default function Stats({ stats }: Props) {
    const categories = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]);

    const getPercentage = (count: number) => {
        return stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
    };

    const getCategoryColor = (category: string) => {
        if (category.includes('Bug')) return 'var(--color-error)';
        if (category.includes('Feature')) return '#22d3ee';
        if (category.includes('Praise')) return 'var(--color-success)';
        if (category.includes('Complaint')) return '#f97316';
        if (category.includes('Question')) return '#eab308';
        return 'var(--color-accent-primary)';
    };

    return (
        <div className="stats-container">
            <div className="stats-header">
                <h2>📊 Feedback Insights</h2>
                <div className="total-badge">
                    <span className="total-number">{stats.total}</span>
                    <span className="total-label">Total</span>
                </div>
            </div>

            <div className="category-stats">
                {categories.map(([category, count]) => (
                    <div key={category} className="stat-item">
                        <div className="stat-header">
                            <span className="stat-category">{category}</span>
                            <span className="stat-count">{count}</span>
                        </div>
                        <div className="stat-bar">
                            <div
                                className="stat-fill"
                                style={{
                                    width: `${getPercentage(count)}%`,
                                    backgroundColor: getCategoryColor(category)
                                }}
                            />
                        </div>
                        <span className="stat-percentage">{getPercentage(count)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
