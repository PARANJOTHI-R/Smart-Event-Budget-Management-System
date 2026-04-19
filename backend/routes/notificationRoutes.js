import express from 'express';
const router = express.Router();
import { getNotifications, markNotificationRead, markAllRead } from '../controllers/notificationController.js';

router.get('/:organizerName', getNotifications);
router.patch('/:id/read', markNotificationRead);
router.patch('/:organizerName/read-all', markAllRead);

export default router;
