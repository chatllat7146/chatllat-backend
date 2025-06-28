import express from "express";
import { createDispute, addEvidence, getDisputesByWalletId, getDisputeDetails } from "../controllers/disputeController.js";

const router = express.Router();

router.post("/", createDispute);
router.patch("/add/evidence", addEvidence);
router.get("/wallet/all/disputes", getDisputesByWalletId);
router.get("/details", getDisputeDetails);

export default router;