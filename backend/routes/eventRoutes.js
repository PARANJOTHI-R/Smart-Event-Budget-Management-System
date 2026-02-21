import express from 'express';
const router = express.Router();

import { createEvent,addExpenseToEvent,getAllEvents} from '../controllers/eventController.js';

router.get('/all', getAllEvents);
router.post('/create', createEvent);
router.post('/:eventId/add-expense', addExpenseToEvent);

export default router;