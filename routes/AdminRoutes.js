import express from "express";
import {
    addHash,
    addSupportTeamUser,
    createAdmin,
    getAllTickets,
    getPaymentDetails,
    login,
    reAssignedDispute,
} from "../controllers/adminController.js";
import {adminAuth} from "../middleware/auth.js"
const router = express.Router();

router.post("/create", createAdmin);
router.post("/login", login);
router.post("/dispute/reAssign", adminAuth, reAssignedDispute);
router.post("/add/hash", adminAuth, addHash);
router.get("/all/tickets", adminAuth, getAllTickets);
router.get("/payment/details", adminAuth, getPaymentDetails);
router.post("/add/support/user", adminAuth, addSupportTeamUser);

export default router;
