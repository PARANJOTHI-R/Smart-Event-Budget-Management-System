import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import mongoose from 'mongoose';
import transpoter from '../config/nodeMailer.js';
import dotenv from 'dotenv';

dotenv.config();
export const register = async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        return res.json({ success: false, message: 'All fields are required' });
    }

    try {
        if (role === 'admin') {
            const { key } = req.body;
            if (key !== process.env.ADMIN_KEY) {
                return res.json({ success: false, message: 'Invalid Admin Key Unauthorized Access' });
            }
        }
        const nameTaken = await userModel.findOne({ name, role });
        if (nameTaken) {
            return res.json({ success: false, message: `Username '${name}' is already taken for role '${role}'` });
        }

        const existingUser = await userModel.findOne({ email, role });
        if (existingUser) {
            return res.json({ success: false, message: `User already exists as an ${role}` });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);
        const newUser = new userModel({ name, email, password: encryptedPassword, role });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        /*email*/
        const mailoption = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Eventify',
            text: `Hi! ${name},\nWelcome to our website and the account is created as ${role} with email ${email}`
        }

        await transpoter.sendMail(mailoption);

        return res.json({ success: true, message: 'user successfully created' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};


export const login = async (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
        return res.json({ success: false, message: 'All fields are requires' });
    }

    try {
        const user = await userModel.findOne({ email, role });

        if (!user) {
            return res.json({
                success: false,
                message: `No ${role} account found with this email.`
            });
        }
        if (user.role !== role) {
            return res.json({
                success: false,
                message: `This account is not registered as an ${role}.`
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ success: true, message: 'successfully logged In' });


    }
    catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        })
    }
    catch (error) {
        return res.json({ success: false, message: error.message })
    }

    return res.json({ success: true, message: 'Logged out successfully' });
}

export const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId);

        if (user.isAccountVerified) {
            return res.json({ success: false, message: 'Already Verified' });
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpire = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();
        const mailoption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account verification otp',
            text: `Your verification otp is ${otp}`
        }

        await transpoter.sendMail(mailoption);
        return res.json({ success: true, message: 'verification otp sent' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


export const verifyAccount = async (req, res) => {

    const { userId, otp } = req.body;
    if (!userId || !otp) {
        return res.json({ success: false, message: 'Missing details' });
    }
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        if (user.verifyOtp === '' || user.verifyOtp != otp) {
            return res.json({ success: false, message: 'Invalid Otp' });
        }

        if (user.verifyOtpExpire < Date.now()) {
            return res.json({ success: false, message: 'Otp Expired' });
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpire = 0
        await user.save();

        return res.json({ success: true, message: 'Successfully verified' });

    } catch (error) {
        return res.json({ success: false, message: error.message });

    }

}

export const isAccountVerified = async (req, res) => {
    try {
        return res.json({ success: true });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

//send password reset otp

export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) return res.json({ success: false, message: "Email is required" });

    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.json({ success: false, message: "User not found" });


        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpire = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();
        const mailoption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Password reset Otp',
            text: `Your reset password otp is ${otp}`
        }

        await transpoter.sendMail(mailoption);

        return res.json({ success: true, message: 'Otp Sent Successfully' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: "Email Otp and NewPassword is required" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!email) {
            return res.json({ success: false, message: "Email is required" });
        }

        if (user.resetOtp === "" || user.resetOtp !== otp) {
            return res.json({ success: false, message: "Invalid Otp" });
        }

        if (user.resetOtpExpire < Date.now()) {
            return res.json({ success: false, message: "Otp Expired" });
        }

        const hashedPass = await bcrypt.hash(newPassword, 10);

        user.password = hashedPass;
        user.resetOtp = '';
        user.resetOtpExpire = 0;
        await user.save();
        return res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

