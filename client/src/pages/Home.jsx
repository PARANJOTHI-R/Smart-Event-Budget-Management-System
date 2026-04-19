import Nav from '../components/Nav.jsx';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import {
    BarChart2, CheckCircle, Bell, Receipt, Shield, RefreshCw,
    ArrowRight, ChevronRight, Zap
} from 'lucide-react';

const features = [
    { Icon: BarChart2, title: 'Smart Budget Tracking', desc: 'Set budgets for each event and track real-time spending with instant visual feedback.' },
    { Icon: CheckCircle, title: 'Approval Workflow', desc: 'Streamlined admin approval for events and expenses ensures financial compliance.' },
    { Icon: BarChart2, title: 'Analytics & Charts', desc: 'Interactive charts showing budget vs spent, category breakdown, and spending trends.' },
    { Icon: Receipt, title: 'Receipt Management', desc: 'Attach receipt images to every expense for a complete audit trail and transparency.' },
    { Icon: Shield, title: 'Role-Based Access', desc: 'Separate, secure dashboards for Admins and Organizers with full access control.' },
    { Icon: Bell, title: 'Real-Time Notifications', desc: 'Instant notifications and email alerts for approvals, rejections, and updates.' },
];

const steps = [
    { n: '01', title: 'Register & Login', desc: 'Create your account as Admin or Organizer using your email.' },
    { n: '02', title: 'Create Event', desc: 'Organizer submits an event with budget for Admin review.' },
    { n: '03', title: 'Admin Approves', desc: 'Admin reviews, approves or rejects with a message.' },
    { n: '04', title: 'Track Expenses', desc: 'Organizer adds expenses with receipts for Admin approval.' },
];

const adminBenefits = [
    'View all events from every organizer',
    'Approve or reject events & expenses with reason',
    'See total fund allocation across all events',
    'Review & approve budget reallocation requests',
    'Access comprehensive financial reports',
    'Monitor spending analytics with live charts',
];
const orgBenefits = [
    'Create and manage your own events',
    'Add expenses with receipts for approval',
    'Request budget reallocation with a message',
    'Get real-time email & in-app notifications',
    'Track spending with visual charts',
    'Edit expenses before they are approved',
];

export default function Home() {
    const { isLoggedIn, userData } = useContext(AppContext);
    const navigate = useNavigate();

    const handleGetStarted = () => {
        if (isLoggedIn) {
            if (userData?.role === 'admin') navigate('/admin-panel');
            else if (userData?.role === 'organizer') navigate('/organizer-panel');
        } else {
            navigate('/login');
        }
    };

    return (
        <>
            <Nav />
            <div className="home-page">
                {/* Hero */}
                <section className="hero-section">
                    <div>
                        <div className="hero-badge">
                            <Zap size={13} strokeWidth={2.5} />
                            Smart Event Finance Management
                        </div>
                        <h1 className="hero-title">
                            Manage Event Budgets<br />
                            <span className="gradient-text">with Confidence</span>
                        </h1>
                        <p className="hero-subtitle">
                            Eventify gives organizers and admins a powerful, intuitive way to plan, track, and approve event budgets — all in one place.
                        </p>
                        <div className="hero-ctas">
                            <button className="btn btn-primary btn-lg" onClick={handleGetStarted} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                {isLoggedIn ? 'Go to Dashboard' : 'Get Started Free'}
                                <ArrowRight size={16} />
                            </button>
                            <a href="#features" className="btn btn-secondary btn-lg">Learn More</a>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <div className="stats-bar">
                    <div className="stat-item"><span className="stat-number">500+</span><span className="stat-label">Events Managed</span></div>
                    <div className="stat-item"><span className="stat-number">₹2Cr+</span><span className="stat-label">Budget Tracked</span></div>
                    <div className="stat-item"><span className="stat-number">100%</span><span className="stat-label">Audit Compliant</span></div>
                    <div className="stat-item"><span className="stat-number">99%</span><span className="stat-label">User Satisfaction</span></div>
                </div>

                {/* Features */}
                <section id="features" className="section section-center">
                    <div className="section-label">Features</div>
                    <h2 className="section-title">Everything you need to manage event budgets</h2>
                    <p className="section-subtitle">From creation to closure — Eventify covers the entire financial lifecycle of your events.</p>
                    <div className="features-grid">
                        {features.map(({ Icon, title, desc }, i) => (
                            <div key={i} className="feature-card">
                                <div className="feature-icon"><Icon size={22} strokeWidth={1.75} /></div>
                                <h3 className="feature-title">{title}</h3>
                                <p className="feature-desc">{desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* How it works */}
                <section className="section section-alt section-center">
                    <div className="section-label">How It Works</div>
                    <h2 className="section-title">Simple 4-step workflow</h2>
                    <p className="section-subtitle">From registration to expense approval — get started in minutes.</p>
                    <div className="steps-container">
                        {steps.map((s, i) => (
                            <div key={i} className="step">
                                <div className="step-number">{s.n}</div>
                                <div className="step-title">{s.title}</div>
                                <p className="step-desc">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Benefits */}
                <section className="section section-center">
                    <div className="section-label">Benefits</div>
                    <h2 className="section-title">Built for everyone on the team</h2>
                    <p className="section-subtitle">Role-based features that empower both admins and organizers.</p>
                    <div className="benefits-grid">
                        <div className="benefit-panel">
                            <div className="benefit-panel-title">
                                <Shield size={20} style={{ color: 'var(--primary)' }} />
                                For Admins
                            </div>
                            {adminBenefits.map((b, i) => (
                                <div key={i} className="benefit-item">
                                    <ChevronRight size={15} className="benefit-check" style={{ color: 'var(--success)', flexShrink: 0 }} /> {b}
                                </div>
                            ))}
                        </div>
                        <div className="benefit-panel">
                            <div className="benefit-panel-title">
                                <Receipt size={20} style={{ color: 'var(--primary)' }} />
                                For Organizers
                            </div>
                            {orgBenefits.map((b, i) => (
                                <div key={i} className="benefit-item">
                                    <ChevronRight size={15} className="benefit-check" style={{ color: 'var(--success)', flexShrink: 0 }} /> {b}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="cta-section">
                    <h2 className="cta-title">Ready to take control of your event budgets?</h2>
                    <p className="cta-sub">Join Eventify today and bring clarity to every rupee spent.</p>
                    <button className="startBut" onClick={handleGetStarted} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                        {isLoggedIn ? 'Go to Your Dashboard' : 'Get Started Now'}
                        <ArrowRight size={18} />
                    </button>
                </section>

                {/* Footer */}
                <footer className="footer">
                    <div className="footer-brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Zap size={16} style={{ color: 'var(--primary)' }} /> Eventify
                    </div>
                    <div className="footer-copy">© 2025 Eventify. Smart Event Budget Management.</div>
                </footer>
            </div>
        </>
    );
}