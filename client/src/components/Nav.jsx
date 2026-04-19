import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';
import { Bell, LogOut, Zap } from 'lucide-react';

export default function Nav() {
    const { isLoggedIn, logout, userData, isSidebarOpen, setIsSidebarOpen } = useContext(AppContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="navContainer">
            <Link to="/" className="nav-brand">
                <div className="nav-brand-icon">
                    <Zap size={18} strokeWidth={2.5} />
                </div>
                Eventify
            </Link>

            <div className="nav-right">
                {isLoggedIn ? (
                    <>
                        <span className="roleName">{userData?.role}</span>
                        {userData?.role === 'organizer' && (
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="nav-icon-btn"
                                title="Notifications"
                            >
                                <Bell size={20} />
                            </button>
                        )}
                        <button className="logoutButton" onClick={handleLogout}>
                            <LogOut size={14} /> Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-btn-ghost">Login</Link>
                        <Link to="/register" className="nav-btn-primary">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}