import { Router } from 'express';
import { getAlerts, addAlert } from '../controllers/alertsController.js';

const router = Router();

// GET /api/alerts - Get all alerts
router.get('/', getAlerts);

// POST /api/alerts - Add new alert
router.post('/', addAlert);

export default router;
