import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
    title: { type: String, required: false },
    amount: { type: Number, required: true },
    category: { type: String, enum: ['Food', 'Venue', 'Marketing', 'Decoration', 'Entertainment', 'Transport', 'Other'], default: 'Other' },
    description: { type: String, default: '', required: true },
    date: { type: Date, default: Date.now },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    receiptImage: { type: String, default: null }, // Base64 data URL
    rejectionReason: { type: String, default: null }
}, { timestamps: true });

const reallocationRequestSchema = new mongoose.Schema({
    requestedAmount: { type: Number, required: true },
    currentBudget: { type: Number, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminMessage: { type: String, default: null },
    requestedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const eventSchema = new mongoose.Schema({
    eventName: { type: String, required: true },
    eventDate: { type: Date, required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    budget: { type: Number, required: true, default: 0 },
    totalSpent: { type: Number, required: true, default: 0 },
    expenses: [expenseSchema],
    status: { type: String, enum: ['pending', 'upcoming', 'ongoing', 'completed', 'rejected'], default: 'pending' },
    rejectionReason: { type: String, default: null },
    reallocationRequests: [reallocationRequestSchema]
}, { timestamps: true });

eventSchema.pre('save', function () {
    if (this.expenses && this.expenses.length > 0) {
        this.totalSpent = this.expenses
            .filter(exp => exp.approvalStatus === 'approved')
            .reduce((sum, exp) => sum + exp.amount, 0);
    } else {
        this.totalSpent = 0;
    }
});

const eventModel = mongoose.models.event || mongoose.model('events', eventSchema);

export default eventModel;