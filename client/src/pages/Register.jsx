import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext.jsx';
import { Mail, Lock, Eye, EyeOff, User, Briefcase, Shield, Key, Zap, Clock, Globe } from 'lucide-react';

export default function Register() {
    const [role, setRole] = useState('organizer');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminKey, setAdminKey] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { setIsLoggedIn, getUserData } = useContext(AppContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { name, email, password, role };
            if (role === 'admin') payload.key = adminKey;
            const { data } = await axios.post('http://localhost:4000/api/auth/register', payload);
            if (data.success) {
                setIsLoggedIn(true);
                await getUserData();
                toast.success('Account created! Welcome to Eventify!', { position: 'top-center' });
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
                    <h1 className="auth-brand-title">Join Eventify</h1>
                    <p className="auth-brand-sub">Create your account and start managing event budgets with confidence.</p>
                    <div className="auth-brand-features">
                        <div className="auth-brand-feature"><Clock size={15} style={{ flexShrink: 0 }} /> Setup in under 2 minutes</div>
                        <div className="auth-brand-feature"><Globe size={15} style={{ flexShrink: 0 }} /> Free to get started</div>
                        <div className="auth-brand-feature"><Lock size={15} style={{ flexShrink: 0 }} /> Secure & encrypted</div>
                        <div className="auth-brand-feature"><Mail size={15} style={{ flexShrink: 0 }} /> Email notifications included</div>
                    </div>
                </div>
            </div>

            <div className="auth-form-panel">
                <h1>Create account</h1>
                <p className="auth-sub">Get started with Eventify today</p>

                <div className="role-toggle">
                    <button className={role === 'organizer' ? 'active' : ''} onClick={() => setRole('organizer')} type="button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Briefcase size={14} /> Organizer
                    </button>
                    <button className={role === 'admin' ? 'active' : ''} onClick={() => setRole('admin')} type="button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Shield size={14} /> Admin
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <label className="auth-label">Full Name</label>
                    <div className="auth-input-group">
                        <span className="input-icon"><User size={15} /></span>
                        <input type="text" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} required />
                    </div>

                    <label className="auth-label">Email Address</label>
                    <div className="auth-input-group">
                        <span className="input-icon"><Mail size={15} /></span>
                        <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>

                    <label className="auth-label">Password</label>
                    <div className="auth-input-group">
                        <span className="input-icon"><Lock size={15} /></span>
                        <input type={showPass ? 'text' : 'password'} placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {role === 'admin' && (
                        <div style={{ animation: 'fadeInUp 0.3s ease' }}>
                            <label className="auth-label">Admin Secret Key</label>
                            <div className="auth-input-group">
                                <span className="input-icon"><Key size={15} /></span>
                                <input type="password" placeholder="Enter admin secret key" value={adminKey} onChange={e => setAdminKey(e.target.value)} required />
                            </div>
                        </div>
                    )}

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? 'Creating account...' : `Create ${role === 'admin' ? 'Admin' : 'Organizer'} Account`}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}