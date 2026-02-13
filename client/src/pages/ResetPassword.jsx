import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
const ResetPassword = () => {
    const { backendUrl } = useContext(AppContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);

    const sendOtp = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(backendUrl + '/api/auth/send-reset-otp', { email }); 
            if (data.success) {
                toast.success(data.message,{position:"top-center"});
                setIsOtpSent(true);
            } else {
                toast.error(data.message,{position:"top-center"});
            }
        } catch (error) {
            toast.error(error.message,{position:"top-center"});
        }
    };

    const onSubmitNewPassword = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(backendUrl + '/api/auth/reset-password', { email, otp, newPassword });
            if (data.success) {
                toast.success(data.message,{position:"top-center"});
                navigate('/login');
            } else {
                toast.error(data.message,{position:"top-center"});
            }
        } catch (error) {
            toast.error(error.message,{position:"top-center"});
        }
    };
    return (
        <>
            <Nav />
            <div className="loginContainer">
                <h1>Reset Password</h1>
                {!isOtpSent ? (
                    <form onSubmit={sendOtp}>
                        <label>Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email" />
                        <button type="submit" className='submitButton' >Send Reset OTP</button>
                    </form>
                ) : (
                    <form onSubmit={onSubmitNewPassword}>
                        <label>Enter OTP</label>
                        <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required placeholder="6-digit OTP" />
                        <label>New Password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="New Password" />
                        <button type="submit" className='submitButton'>Update Password</button>
                    </form>
                )}
            </div>
        </>
    );

}
export default ResetPassword;