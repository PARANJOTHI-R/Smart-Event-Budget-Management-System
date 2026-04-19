import { useContext } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgetPassword from './pages/ResetPassword.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { AppContextProvider } from './context/AppContext.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import OrganizerPanel from './pages/OrganizerPanel.jsx'
import { AppContext } from './context/AppContext.jsx'

function ProtectedRoute({ children, requiredRole }) {
    const { isLoggedIn, userData } = useContext(AppContext);
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    if (requiredRole && userData?.role !== requiredRole) return <Navigate to="/" replace />;
    return children;
}

function AppContent() {
    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/reset-password' element={<ForgetPassword />} />
            <Route path='/admin-panel' element={
                <ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>
            } />
            <Route path='/organizer-panel' element={
                <ProtectedRoute requiredRole="organizer"><OrganizerPanel /></ProtectedRoute>
            } />
        </Routes>
    );
}

function App() {
    return (
        <>
            <ToastContainer position="top-center" autoClose={3000} />
            <BrowserRouter>
                <AppContextProvider>
                    <AppContent />
                </AppContextProvider>
            </BrowserRouter>
        </>
    );
}

export default App
