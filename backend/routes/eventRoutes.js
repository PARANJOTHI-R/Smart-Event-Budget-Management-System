import express from 'express';
const router = express.Router();
import upload from '../middleware/upload.js';

import {
    createEvent,
    addExpenseToEvent,
    getAllEvents,
    deleteExpense,
    updateExpense,
    approveEvent,
    rejectEvent,
    approveExpense,
    rejectExpense,
    getAnalytics,
    requestReallocation,
    approveReallocation,
    rejectReallocation
} from '../controllers/eventController.js';

// Events
router.get('/all', getAllEvents);
router.get('/analytics', getAnalytics);
router.post('/create', createEvent);

// Event approval
router.patch('/:eventId/approve', approveEvent);
router.patch('/:eventId/reject', rejectEvent);

// Expenses
router.post('/:eventId/add-expense', upload.single('receipt'), addExpenseToEvent);
router.put('/:eventId/expenses/:expenseId', upload.single('receipt'), updateExpense);
router.delete('/:eventId/expenses/:expenseId', deleteExpense);

// Expense approval
router.patch('/:eventId/expenses/:expenseId/approve', approveExpense);
router.patch('/:eventId/expenses/:expenseId/reject', rejectExpense);

// Fund reallocation
router.post('/:eventId/reallocation-request', requestReallocation);
router.patch('/:eventId/reallocation/:requestId/approve', approveReallocation);
router.patch('/:eventId/reallocation/:requestId/reject', rejectReallocation);

export default router;