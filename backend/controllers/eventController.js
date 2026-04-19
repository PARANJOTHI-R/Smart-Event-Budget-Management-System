import eventModel from "../models/eventModel.js";
import userModel from "../models/userModel.js";
import notificationModel from "../models/notificationModel.js";
import mongoose from "mongoose";
import transporter from "../config/nodeMailer.js";

// Helper: send email + save notification
const notify = async ({ organizerId, message, type, relatedEvent, email, emailSubject }) => {
    // Save to DB
    await notificationModel.create({
        organizer: organizerId,
        message,
        type,
        relatedEvent: relatedEvent || null
    });
    // Send email
    if (email && emailSubject) {
        try {
            await transporter.sendMail({
                from: process.env.SENDER_EMAIL,
                to: email,
                subject: emailSubject,
                text: message
            });
        } catch (e) {
            console.error('Email send error:', e.message);
        }
    }
};

// ─── CREATE EVENT ────────────────────────────────────────────────────────────
export const createEvent = async (req, res) => {
    try {
        const { eventName, eventDate, budget, organizerId } = req.body;
        let user;
        const isValidId = mongoose.Types.ObjectId.isValid(organizerId);
        if (isValidId) {
            user = await userModel.findById(organizerId);
        } else {
            user = await userModel.findOne({ name: organizerId });
        }
        if (!user) {
            return res.status(404).json({ success: false, message: `User '${organizerId}' not found.` });
        }
        const newEvent = new eventModel({ eventName, eventDate, budget, organizer: user._id });
        await newEvent.save();
        res.status(201).json({ success: true, message: 'Event created successfully', event: newEvent });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// ─── GET ALL EVENTS ──────────────────────────────────────────────────────────
// Admin: all events. Organizer: pass organizerName query param to filter.
export const getAllEvents = async (req, res) => {
    try {
        const { organizerName } = req.query;
        let filter = {};
        if (organizerName) {
            const user = await userModel.findOne({ name: organizerName });
            if (!user) return res.status(404).json({ success: false, message: `Organizer '${organizerName}' not found` });
            filter = { organizer: user._id };
        }
        const events = await eventModel.find(filter).populate('organizer', 'name email').sort({ createdAt: -1 });
        res.status(200).json({ success: true, events });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// ─── ANALYTICS ───────────────────────────────────────────────────────────────
export const getAnalytics = async (req, res) => {
    try {
        const { organizerName } = req.query;
        let filter = {};
        if (organizerName) {
            const user = await userModel.findOne({ name: organizerName });
            if (user) filter = { organizer: user._id };
        }
        const events = await eventModel.find(filter).populate('organizer', 'name');

        const totalBudget = events.reduce((s, e) => s + e.budget, 0);
        const totalSpent = events.reduce((s, e) => s + e.totalSpent, 0);
        const pendingAmount = events.reduce((s, ev) => {
            return s + ev.expenses.filter(x => x.approvalStatus === 'pending').reduce((a, x) => a + x.amount, 0);
        }, 0);

        // Per event budget vs spent
        const perEvent = events.map(e => ({
            name: e.eventName,
            budget: e.budget,
            spent: e.totalSpent,
            remaining: e.budget - e.totalSpent
        }));

        // Category breakdown (approved expenses only)
        const categoryMap = {};
        events.forEach(ev => {
            ev.expenses.filter(x => x.approvalStatus === 'approved').forEach(exp => {
                categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
            });
        });
        const categoryBreakdown = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

        // Expense trend over time (approved, group by month)
        const trendMap = {};
        events.forEach(ev => {
            ev.expenses.filter(x => x.approvalStatus === 'approved').forEach(exp => {
                const month = new Date(exp.date).toLocaleString('default', { month: 'short', year: '2-digit' });
                trendMap[month] = (trendMap[month] || 0) + exp.amount;
            });
        });
        const expenseTrend = Object.entries(trendMap)
            .sort((a, b) => new Date('01 ' + a[0]) - new Date('01 ' + b[0]))
            .map(([month, amount]) => ({ month, amount }));

        res.status(200).json({
            success: true,
            totalBudget,
            totalSpent,
            pendingAmount,
            totalEvents: events.length,
            perEvent,
            categoryBreakdown,
            expenseTrend
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// ─── ADD EXPENSE ─────────────────────────────────────────────────────────────
export const addExpenseToEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { category, description, amount, date } = req.body;
        const event = await eventModel.findById(eventId);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        if (!['upcoming', 'ongoing'].includes(event.status)) {
            return res.status(400).json({ success: false, message: 'Expenses can only be added to approved (upcoming/ongoing) events' });
        }

        const parsedAmount = parseFloat(amount);
        const currentAllocated = event.expenses.reduce((s, x) => s + x.amount, 0);
        if (parsedAmount <= 0) return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
        if (parsedAmount > event.budget || parsedAmount + currentAllocated > event.budget) {
            return res.status(400).json({ success: false, message: 'Expense amount exceeds event budget' });
        }

        const expenseDate = new Date(date);
        const eventDatePlus = new Date(new Date(event.eventDate).getTime() + 48 * 60 * 60 * 1000);
        if (expenseDate > eventDatePlus) {
            return res.status(400).json({ success: false, message: 'Expense date cannot be more than 48hrs after event date' });
        }

        // Handle receipt image
        let receiptImage = null;
        if (req.file) {
            const mimeType = req.file.mimetype;
            const base64 = req.file.buffer.toString('base64');
            receiptImage = `data:${mimeType};base64,${base64}`;
        }

        event.expenses.push({ title: description, category, description, amount: parsedAmount, date, receiptImage });
        await event.save();
        res.status(200).json({ success: true, event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── UPDATE EXPENSE ───────────────────────────────────────────────────────────
export const updateExpense = async (req, res) => {
    try {
        const { eventId, expenseId } = req.params;
        const { category, description, amount, date } = req.body;
        const event = await eventModel.findById(eventId);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        const expense = event.expenses.id(expenseId);
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
        if (expense.approvalStatus === 'approved') {
            return res.status(400).json({ success: false, message: 'Approved expenses cannot be edited.' });
        }

        const parsedAmount = parseFloat(amount);
        const otherTotal = event.expenses.reduce((s, x) => x._id.toString() === expenseId ? s : s + x.amount, 0);
        if (parsedAmount + otherTotal > event.budget) {
            return res.status(400).json({ success: false, message: `Update failed. Would exceed budget of ₹${event.budget.toLocaleString()}` });
        }
        if (parsedAmount <= 0) return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });

        expense.category = category;
        expense.description = description;
        expense.amount = parsedAmount;
        expense.date = date;

        if (req.file) {
            const mimeType = req.file.mimetype;
            const base64 = req.file.buffer.toString('base64');
            expense.receiptImage = `data:${mimeType};base64,${base64}`;
        }

        await event.save();
        res.status(200).json({ success: true, message: 'Expense updated successfully', event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── DELETE EXPENSE ───────────────────────────────────────────────────────────
export const deleteExpense = async (req, res) => {
    try {
        const { eventId, expenseId } = req.params;
        const event = await eventModel.findById(eventId);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        const expense = event.expenses.id(expenseId);
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
        if (expense.approvalStatus === 'approved') {
            return res.status(400).json({ success: false, message: 'Approved expenses cannot be deleted. Contact Admin.' });
        }
        event.expenses.pull(expenseId);
        await event.save();
        res.status(200).json({ success: true, message: 'Expense deleted successfully', event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── APPROVE EVENT ───────────────────────────────────────────────────────────
export const approveEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await eventModel.findById(eventId).populate('organizer', 'name email');
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        event.status = 'upcoming';
        event.rejectionReason = null;
        await event.save();

        const msg = `✅ Your event "${event.eventName}" has been approved! You can now start adding expenses.`;
        await notify({
            organizerId: event.organizer._id,
            message: msg,
            type: 'event_approved',
            relatedEvent: event._id,
            email: event.organizer.email,
            emailSubject: `Event Approved: ${event.eventName}`
        });

        res.status(200).json({ success: true, message: 'Event approved', event });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// ─── REJECT EVENT ────────────────────────────────────────────────────────────
export const rejectEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { reason } = req.body;
        const event = await eventModel.findById(eventId).populate('organizer', 'name email');
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        event.status = 'rejected';
        event.rejectionReason = reason || 'No reason provided';
        await event.save();

        const msg = `❌ Your event "${event.eventName}" has been rejected.\nReason: ${event.rejectionReason}`;
        await notify({
            organizerId: event.organizer._id,
            message: msg,
            type: 'event_rejected',
            relatedEvent: event._id,
            email: event.organizer.email,
            emailSubject: `Event Rejected: ${event.eventName}`
        });

        res.status(200).json({ success: true, message: 'Event rejected', event });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// ─── APPROVE EXPENSE ─────────────────────────────────────────────────────────
export const approveExpense = async (req, res) => {
    try {
        const { eventId, expenseId } = req.params;
        const event = await eventModel.findById(eventId).populate('organizer', 'name email');
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        const expense = event.expenses.id(expenseId);
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
        expense.approvalStatus = 'approved';
        expense.rejectionReason = null;
        await event.save();

        const msg = `✅ Your expense of ₹${expense.amount.toLocaleString()} (${expense.category}) for event "${event.eventName}" has been approved.`;
        await notify({
            organizerId: event.organizer._id,
            message: msg,
            type: 'expense_approved',
            relatedEvent: event._id,
            email: event.organizer.email,
            emailSubject: `Expense Approved — ${event.eventName}`
        });

        res.status(200).json({ success: true, message: 'Expense approved', event });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// ─── REJECT EXPENSE ───────────────────────────────────────────────────────────
export const rejectExpense = async (req, res) => {
    try {
        const { eventId, expenseId } = req.params;
        const { reason } = req.body;
        const event = await eventModel.findById(eventId).populate('organizer', 'name email');
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        const expense = event.expenses.id(expenseId);
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
        expense.approvalStatus = 'rejected';
        expense.rejectionReason = reason || 'No reason provided';
        await event.save();

        const msg = `❌ Your expense of ₹${expense.amount.toLocaleString()} (${expense.category}) for event "${event.eventName}" was rejected.\nReason: ${expense.rejectionReason}`;
        await notify({
            organizerId: event.organizer._id,
            message: msg,
            type: 'expense_rejected',
            relatedEvent: event._id,
            email: event.organizer.email,
            emailSubject: `Expense Rejected — ${event.eventName}`
        });

        res.status(200).json({ success: true, message: 'Expense rejected', event });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// ─── REQUEST REALLOCATION ─────────────────────────────────────────────────────
export const requestReallocation = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { requestedAmount, message } = req.body;
        const event = await eventModel.findById(eventId);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        if (!['upcoming', 'ongoing'].includes(event.status)) {
            return res.status(400).json({ success: false, message: 'Can only request reallocation for approved events' });
        }
        const hasPending = event.reallocationRequests.some(r => r.status === 'pending');
        if (hasPending) {
            return res.status(400).json({ success: false, message: 'A reallocation request is already pending for this event' });
        }
        event.reallocationRequests.push({
            requestedAmount: parseFloat(requestedAmount),
            currentBudget: event.budget,
            message
        });
        await event.save();
        res.status(200).json({ success: true, message: 'Reallocation request submitted', event });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// ─── APPROVE REALLOCATION ─────────────────────────────────────────────────────
export const approveReallocation = async (req, res) => {
    try {
        const { eventId, requestId } = req.params;
        const { adminMessage } = req.body;
        const event = await eventModel.findById(eventId).populate('organizer', 'name email');
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        const request = event.reallocationRequests.id(requestId);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        const oldBudget = event.budget;
        event.budget = request.requestedAmount;
        request.status = 'approved';
        request.adminMessage = adminMessage || 'Approved';
        await event.save();

        const msg = `✅ Your budget reallocation request for "${event.eventName}" has been approved.\nBudget updated: ₹${oldBudget.toLocaleString()} → ₹${event.budget.toLocaleString()}.\n${adminMessage ? 'Admin note: ' + adminMessage : ''}`;
        await notify({
            organizerId: event.organizer._id,
            message: msg,
            type: 'reallocation_approved',
            relatedEvent: event._id,
            email: event.organizer.email,
            emailSubject: `Budget Reallocation Approved — ${event.eventName}`
        });

        res.status(200).json({ success: true, message: 'Reallocation approved', event });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

// ─── REJECT REALLOCATION ──────────────────────────────────────────────────────
export const rejectReallocation = async (req, res) => {
    try {
        const { eventId, requestId } = req.params;
        const { adminMessage } = req.body;
        const event = await eventModel.findById(eventId).populate('organizer', 'name email');
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        const request = event.reallocationRequests.id(requestId);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        request.status = 'rejected';
        request.adminMessage = adminMessage || 'Rejected by admin';
        await event.save();

        const msg = `❌ Your budget reallocation request for "${event.eventName}" (₹${request.requestedAmount.toLocaleString()}) was rejected.\nReason: ${request.adminMessage}`;
        await notify({
            organizerId: event.organizer._id,
            message: msg,
            type: 'reallocation_rejected',
            relatedEvent: event._id,
            email: event.organizer.email,
            emailSubject: `Budget Reallocation Rejected — ${event.eventName}`
        });

        res.status(200).json({ success: true, message: 'Reallocation rejected', event });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};