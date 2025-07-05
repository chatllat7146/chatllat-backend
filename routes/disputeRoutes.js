import express from "express";
import { createDispute, addEvidence, getDisputesByWalletId, getDisputeDetails, updateEvidence } from "../controllers/disputeController.js";

const router = express.Router();

router.post("/", createDispute);
router.patch("/add/evidence", addEvidence);
router.get("/wallet/all/disputes", getDisputesByWalletId);
router.get("/details", getDisputeDetails);
router.patch("/update/evidence", updateEvidence);

export default router;