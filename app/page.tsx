import Link from "next/link";

export default function Home() {
  return (
    <div className="landing-container">
      <nav className="navbar glass">
        <div className="logo-section">
          <span className="logo-text">Social<span className="text-primary">AI</span></span>
        </div>
        <div className="nav-links">
          <Link href="/pricing" className="nav-link">Pricing</Link>
          <Link href="/login" className="btn-secondary">Login</Link>
          <Link href="/register" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Manage your social media <br />
            <span className="gradient-text">with Superhuman Intelligence</span>
          </h1>
          <p className="hero-description">
            Generate 30 days of content in seconds. Auto-publish, analyze, and optimize 
            your brand across all platforms with our AI-first manager.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="btn-primary btn-lg">Start Free Trial</Link>
            <Link href="/demo" className="btn-glass btn-lg">Watch Demo</Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="dashboard-preview glass">
            {/* Visual placeholder for dashboard */}
            <div className="preview-header">
              <div className="header-dot red"></div>
              <div className="header-dot yellow"></div>
              <div className="header-dot green"></div>
            </div>
            <div className="preview-content">
              <div className="preview-sidebar"></div>
              <div className="preview-main">
                <div className="preview-card"></div>
                <div className="preview-card"></div>
                <div className="preview-card"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className="features-grid">
        <div className="feature-card glass glass-hover">
          <h3>AI Calendar</h3>
          <p>Generate a full month of posts based on your niche and goals.</p>
        </div>
        <div className="feature-card glass glass-hover">
          <h3>Auto-Publish</h3>
          <p>Schedule and post automatically to FB, IG, X, and LinkedIn.</p>
        </div>
        <div className="feature-card glass glass-hover">
          <h3>Smart Analytics</h3>
          <p>Get AI-driven insights on how to improve your engagement.</p>
        </div>
      </section>

      <style jsx>{`
        .landing-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 4rem;
          position: sticky;
          top: 0;
          z-index: 100;
          margin-top: 1rem;
          margin-left: 2rem;
          margin-right: 2rem;
          border-radius: 1rem;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.05em;
        }

        .text-primary {
          color: var(--primary);
        }

        .nav-links {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .nav-link {
          color: var(--text-muted);
          transition: var(--transition-smooth);
        }

        .nav-link:hover {
          color: var(--foreground);
        }

        .hero-section {
          padding: 6rem 4rem;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 4rem;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: 4.5rem;
          line-height: 1.1;
          margin-bottom: 2rem;
        }

        .gradient-text {
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-description {
          font-size: 1.25rem;
          margin-bottom: 3rem;
          max-width: 600px;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          transition: var(--transition-smooth);
        }

        .btn-primary:hover {
          background: var(--secondary);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);
        }

        .btn-secondary {
          color: white;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
        }

        .btn-glass {
          background: var(--surface);
          border: 1px solid var(--border);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          backdrop-filter: var(--glass-blur);
          transition: var(--transition-smooth);
        }

        .btn-glass:hover {
          background: var(--surface-hover);
          transform: translateY(-2px);
        }

        .btn-lg {
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
        }

        .hero-visual {
          perspective: 1000px;
        }

        .dashboard-preview {
          height: 400px;
          border-radius: 1.5rem;
          overflow: hidden;
          transform: rotateY(-15deg) rotateX(5deg);
          box-shadow: -20px 20px 50px rgba(0, 0, 0, 0.5);
        }

        .preview-header {
          height: 40px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          gap: 8px;
          align-items: center;
          padding: 0 1rem;
        }

        .header-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .red { background: #ff5f57; }
        .yellow { background: #febc2e; }
        .green { background: #28c840; }

        .preview-content {
          display: grid;
          grid-template-columns: 80px 1fr;
          height: 100%;
        }

        .preview-sidebar {
          background: rgba(255, 255, 255, 0.02);
          border-right: 1px solid var(--border);
        }

        .preview-main {
          padding: 2rem;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .preview-card {
          height: 120px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 0.75rem;
          border: 1px solid var(--border);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          padding: 4rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .feature-card {
          padding: 2.5rem;
          border-radius: 1.5rem;
          text-align: center;
          transition: var(--transition-smooth);
        }

        .feature-card h3 {
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }

        @media (max-width: 1024px) {
          .hero-section {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .hero-description {
            margin: 0 auto 3rem;
          }
          .hero-actions {
            justify-content: center;
          }
          .hero-visual {
            display: none;
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
          .navbar {
            padding: 1rem 2rem;
          }
        }
      `}</style>
    </div>
  );
}
