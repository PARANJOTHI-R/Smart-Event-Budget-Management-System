import express from 'express';
const router = express.Router();

import { createEvent,addExpenseToEvent,getAllEvents,deleteExpense,updateExpense} from '../controllers/eventController.js';

router.get('/all', getAllEvents);
router.post('/create', createEvent);
router.post('/:eventId/add-expense', addExpenseToEvent);
router.delete('/:eventId/expenses/:expenseId', deleteExpense);
router.put('/:eventId/expenses/:expenseId', updateExpense);
export default router;