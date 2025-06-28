import express from "express";
import {
    changePassword,
    splitDisputeAmount,
    getAllTickets,
    login,
    myAllTickets,
    myTicketDetails,
    resendOtp,
    resetPassword,
    sendForgotOtp,
    signup,
    signupOtpVerify,
    ticketDetails,
    verifyForgotOtp,
    takeATicket,
} from "../controllers/supportTeamController.js";
import { supportAuth } from "../middleware/auth.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/signupOtp/verify", signupOtpVerify);
router.post("/forgotOtp/send", sendForgotOtp);
router.post("/forgotOtp/verify", verifyForgotOtp);
router.post("/reset/password", resetPassword);
router.post("/resendOtp", resendOtp);
router.post("/change/password", supportAuth, changePassword);
router.get("/tickets/all", supportAuth, getAllTickets);
router.get("/ticket/details", supportAuth, ticketDetails);
router.get("/my_ticket/details", supportAuth, myTicketDetails);
router.get("/my_tickets/all", supportAuth, myAllTickets);
router.post("/split/amount", supportAuth, splitDisputeAmount);
router.post("/take_a_ticket", supportAuth, takeATicket)

export default router;
