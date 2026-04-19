import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext.jsx';
import { Mail, Lock, Eye, EyeOff, Briefcase, Shield, Bell, Receipt, Zap } from 'lucide-react';

export default function Login() {
    const [role, setRole] = useState('organizer');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { setIsLoggedIn, getUserData } = useContext(AppContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post('http://localhost:4000/api/auth/login', { email, password, role });
            if (data.success) {
                setIsLoggedIn(true);
                await getUserData();
                toast.success('Welcome back!', { position: 'top-center' });
                navigate(role === 'admin' ? '/admin-panel' : '/organizer-panel');
            } else {
                toast.error(data.message, { position: 'top-center' });
            }
        } catch (err) {
            toast.error(err.message, { position: 'top-center' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-brand">
                <div className="auth-brand-content">
                    <div className="auth-brand-icon">
                        <Zap size={36} strokeWidth={2} />
                    </div>
                    <h1 className="auth-brand-title">Eventify</h1>
                    <p className="auth-brand-sub">Smart Event Budget Management for modern teams and organizations.</p>
                    <div className="auth-brand-features">
                        <div className="auth-brand-feature"><Shield size={15} style={{ flexShrink: 0 }} /> Role-based access control</div>
                        <div className="auth-brand-feature"><Briefcase size={15} style={{ flexShrink: 0 }} /> Real-time analytics</div>
                        <div className="auth-brand-feature"><Bell size={15} style={{ flexShrink: 0 }} /> Instant notifications</div>
                        <div className="auth-brand-feature"><Receipt size={15} style={{ flexShrink: 0 }} /> Receipt management</div>
                    </div>
                </div>
            </div>

            <div className="auth-form-panel">
                <h1>Welcome back</h1>
                <p className="auth-sub">Sign in to your Eventify account</p>

                <div className="role-toggle">
                    <button className={role === 'organizer' ? 'active' : ''} onClick={() => setRole('organizer')} type="button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Briefcase size={14} /> Organizer
                    </button>
                    <button className={role === 'admin' ? 'active' : ''} onClick={() => setRole('admin')} type="button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Shield size={14} /> Admin
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <label className="auth-label">Email Address</label>
                    <div className="auth-input-group">
                        <span className="input-icon"><Mail size={15} /></span>
                        <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>

                    <label className="auth-label">Password</label>
                    <div className="auth-input-group">
                        <span className="input-icon"><Lock size={15} /></span>
                        <input type={showPass ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: 20 }}>
                        <Link to="/reset-password" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</Link>
                    </div>

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? 'Signing in...' : `Sign in as ${role === 'admin' ? 'Admin' : 'Organizer'}`}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    );
}