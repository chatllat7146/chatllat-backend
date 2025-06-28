import asyncHandler from "../helper/async.js";
import give_response from "../helper/help.js";
import bcryptjs from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import Admin from "../models/Admin.js";
import {
    addHashSchema,
    adminLoginSchema,
    getPaymentDetailSchema,
    reAssignedDisputeSchema,
} from "../utils/validation/admin_validation.js";
import Dispute from "../models/Dispute.js";
import Agreement from "../models/Agreement.js";
import { addHashLink, fetchPaymentDetails } from "../utils/service/admin.js";
import { allTickets } from "../utils/service/support.js";
import { allTicketSchema } from "../utils/validation/supportTeam_validation.js";

export const createAdmin = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        const isExist = await Admin.findOne({ email });
        if (isExist)
            return give_response(res, 400, false, "Admin already exist");

        const hashPass = await bcryptjs.hash(password, 8);
        const admin = await Admin.create({
            email,
            password: hashPass,
        });

        delete admin._doc.password;
        return give_response(res, 200, true, "Profile created successfully", {
            admin,
        });
    } catch (error) {
        return give_response(res, 500, false, error.message);
    }
});

export const login = asyncHandler(async (req, res) => {
    try {
        const reqData = req.body;
        const validatedData = await adminLoginSchema.validateAsync(reqData);
        const { email, password } = validatedData;

        const user = await Admin.findOne({ email }).select("+password");
        if (!user)
            return give_response(
                res,
                404,
                false,
                "Admin not exist with this email"
            );

        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) return give_response(res, 400, false, "Wrong password");

        const token = generateToken({ userId: user._id, email: user.email });

        delete user._doc.password;
        give_response(res, 200, true, "Login successfully", {
            user,
            token,
        });
    } catch (error) {
        return give_response(res, 500, false, error.message);
    }
});

export const reAssignedDispute = asyncHandler(async (req, res) => {
    try {
        const reqData = req.body;
        const validatedData = await reAssignedDisputeSchema.validateAsync(
            reqData
        );
        const { disputeId, reAssignedReason } = validatedData;

        const dispute = await Dispute.findOneAndUpdate(
            { disputeId },
            { $set: { status: "ReAssigned", reAssignedReason } },
            { new: true }
        );

        give_response(
            res,
            200,
            true,
            "Dispute reAssigned successfully",
            dispute
        );
    } catch (error) {
        return give_response(res, 500, false, error.message);
    }
});

export const addHash = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const validatedData = await addHashSchema.validateAsync(reqData);
        const { hash, type, agreementId } = validatedData;

        const agreement = await Agreement.findOne({ agreementId });
        if (!agreement)
            return give_response(res, 404, false, "Agreement not found");

        const hashField = type === "Payer" ? "payerHash" : "receiverHash";
        if (agreement.hashLink[hashField]) {
            return give_response(res, 409, false, `${type}Hash already added`);
        }

        const updatedAgreement = await addHashLink(hash, hashField, agreement);

        return give_response(
            res,
            200,
            true,
            "Hash added successfully",
            updatedAgreement
        );
    } catch (error) {
        return give_response(res, 500, false, error.message);
    }
});

export const getAllTickets = asyncHandler(async (req, res) => {
    try {
        const reqData = req.query;
        const validatedData = await allTicketSchema.validateAsync(reqData);

        const tickets = await allTickets(validatedData);

        give_response(res, 200, true, "Dispute get successfully", {
            tickets,
        });
    } catch (error) {
        return give_response(res, 500, false, error.message);
    }
});

export const getPaymentDetails = asyncHandler(async (req, res) => {
    try {
        const reqData = req.query;
        const validatedData = await getPaymentDetailSchema.validateAsync(
            reqData
        );
        const { disputeId } = validatedData;

        const dispute = await fetchPaymentDetails(disputeId)
        
        give_response(res, 200, true, "Payment details get successfully", {
            dispute,
        });
    } catch (error) {
        return give_response(res, 500, false, error.message);
    }
});
