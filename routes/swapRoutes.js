import express from 'express';
import { swapAmount } from '../controllers/swapController.js';

const router = express.Router();

router.post('/swap_amount', swapAmount)


export default router;