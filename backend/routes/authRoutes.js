import express from 'express';
import { isAccountVerified, login, logout, register, resetPassword, sendResetOtp, sendVerifyOtp, verifyAccount } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter=express.Router();

authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.post('/send-verify-otp',userAuth,sendVerifyOtp);
authRouter.post('/verify-email',userAuth,verifyAccount);
authRouter.post('/is-auth',userAuth,isAccountVerified);

authRouter.post('/send-reset-otp',sendResetOtp);
authRouter.post('/reset-password',resetPassword);





export default authRouter;