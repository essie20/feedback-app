import './Header.css';

export default function Header() {
    return (
        <header className="header">
            <div className="header-bg-glow"></div>
            <div className="container header-content">
                <div className="logo">
                    <span className="logo-icon">🌟</span>
                    <span className="logo-text">AI Feedback</span>
                </div>

                <div className="header-text">
                    <h1>AI-Powered Feedback Collector</h1>
                    <p className="tagline">
                        Share your feedback and watch AI categorize it instantly using{' '}
                        <span className="highlight">Google Gemini</span>
                    </p>
                </div>

                <div className="tech-badges">
                    <span className="badge">React</span>
                    <span className="badge">Node.js</span>
                    <span className="badge">AWS</span>
                    <span className="badge">Gemini AI</span>
                </div>
            </div>
        </header>
    );
}
