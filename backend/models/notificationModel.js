import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['expense_approved', 'expense_rejected', 'event_approved', 'event_rejected', 'reallocation_approved', 'reallocation_rejected', 'info'],
        default: 'info'
    },
    relatedEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'events', default: null },
    read: { type: Boolean, default: false }
}, { timestamps: true });

const notificationModel = mongoose.models.notification || mongoose.model('notifications', notificationSchema);

export default notificationModel;
