import notificationModel from "../models/notificationModel.js";
import userModel from "../models/userModel.js";

export const getNotifications = async (req, res) => {
    try {
        const { organizerName } = req.params;
        const user = await userModel.findOne({ name: organizerName });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        const notifications = await notificationModel.find({ organizer: user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json({ success: true, notifications });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

export const markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        await notificationModel.findByIdAndUpdate(id, { read: true });
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

export const markAllRead = async (req, res) => {
    try {
        const { organizerName } = req.params;
        const user = await userModel.findOne({ name: organizerName });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        await notificationModel.updateMany({ organizer: user._id, read: false }, { read: true });
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
