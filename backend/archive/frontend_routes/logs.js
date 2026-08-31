import { Router } from 'express';
import { getLogs, addLog } from '../controllers/logsController.js';

const router = Router();

// GET /api/logs - Get all logs
router.get('/', getLogs);

// POST /api/logs - Add new log
router.post('/', addLog);

export default router;
