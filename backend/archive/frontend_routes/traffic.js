import { Router } from 'express';
import { getTraffic, addTraffic } from '../controllers/trafficController.js';

const router = Router();

// GET /api/traffic - Get all traffic data
router.get('/', getTraffic);

// POST /api/traffic - Add new traffic entry
router.post('/', addTraffic);

export default router;
