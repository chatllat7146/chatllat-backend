import express from "express";
import { transectionConfirmation } from "../controllers/webhookController.js";

const router = express.Router();

router.post("/transection/confirmation", transectionConfirmation);

export default router;