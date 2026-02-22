
import eventModel from "../models/eventModel.js";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";
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
            return res.status(404).json({
                success: false,
                message: `User '${organizerId}' not found. Please register the user first.`
            });
        }

        const newEvent = new eventModel({
            eventName,
            eventDate,
            budget,
            organizer: user._id
        });
        await newEvent.save();
        res.status(201).json({ success: true, message: 'Event created successfully', event: newEvent });
    } catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: e.message });
    }
};

export const addExpenseToEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { category, description, amount, date } = req.body;
        const event = await eventModel.findById(eventId);
        if (!event) return res.json({ message: "Event not found" });
        if (amount > event.budget) {
            return res.json({ success: false, message: 'Expense amount exceeds event budget' });
        }
        if (amount <= 0) {
            return res.status(400).json({ success: false, message: 'Expense amount must be greater than zero' });
        }
        const eventDate = new Date(event.eventDate);
        const eventDatePlus = new Date(eventDate.getTime() + 48 * 60 * 60 * 1000);
        const expenseDate = new Date(date);


        if (expenseDate > eventDatePlus) {
            return res.status(400).json({ success: false, message: 'Expense date cannot be after 48 hrs of event date' });
        }

        event.expenses.push({
            title: description,
            category,
            description,
            amount,
            date
        });
        await event.save();

        res.status(200).json({ success: true, event });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllEvents = async (req, res) => {
    try {
        const { organizerName } = req.query;
        let filter = {};

        if (organizerName) {
            const user = await userModel.findOne({ name: organizerName });
            if (!user) {
                return res.status(404).json({ success: false, message: `Organizer '${organizerName}' not found` });
            }
            filter = { organizer: user._id };
        }

        const events = await eventModel.find(filter).populate('organizer', 'name');
        res.status(200).json({ success: true, events });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};