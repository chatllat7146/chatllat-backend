import express from 'express';
import { getSignature } from '../controllers/withdrawalController.js';

const router = express.Router();

router.post('/get-signature', getSignature)


export default router;