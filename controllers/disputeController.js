import asyncHandler from "../helper/async.js";
import give_response from "../helper/help.js";
import Dispute from "../models/Dispute.js";
import {
    addEvidenceSchema,
    createDisputeSchema,
    updateEvidenceSchema,
} from "../utils/validation/dispute_validation.js";
import { dataReturnOnlyIfAgreementExist } from "../utils/service/agreement.js";
import {
    disputeAdd,
    disputesByWalletId,
    evidenceAdd,
} from "../utils/service/dispute.js";

export const createDispute = asyncHandler(async (req, res) => {
    try {
        const reqData = req.body;
        const validatedData = await createDisputeSchema.validateAsync(reqData);
        const { agreementId } = validatedData;

        const agreement = await dataReturnOnlyIfAgreementExist(agreementId);
        if (!agreement)
            return give_response(res, 404, false, "Agreement not found");

        const dispute = await disputeAdd(validatedData, agreement);

        return give_response(res, 200, true, "Dispute create successfully", {
            dispute,
        });
    } catch (error) {
        return give_response(res, 500, false, error.message);
    }
});

export const addEvidence = asyncHandler(async (req, res) => {
    try {
        const reqData = req.body;
        const validatedData = await addEvidenceSchema.validateAsync(reqData);
        const { agreementId } = validatedData;

        const dispute = await Dispute.findOne({ agreementId });
        if (!dispute)
            return give_response(res, 404, false, "dispute not found");

        await evidenceAdd(validatedData, dispute);

        return give_response(res, 200, true, "Evidence add successfully", {});
    } catch (error) {
        return give_response(res, 500, false, error.message);
    }
});

//  get Dispute data for particular wallet
export const getDisputesByWalletId = asyncHandler(async (req, res) => {
    try {
        const { connectedWalletId } = req.query;
        const disputes = await disputesByWalletId(connectedWalletId);

        return give_response(res, 200, true, "Disputes get successfully", {
            disputes,
        });
    } catch (error) {
        return give_response(res, 500, false, error.message);
    }
});

//  get Dispute details by agreementId
export const getDisputeDetails = asyncHandler(async (req, res) => {
    try {
        const { agreementId } = req.query;

        const dispute = await Dispute.findOne({ agreementId });
        if (!dispute)
            return give_response(res, 404, false, "dispute not found");

        return give_response(
            res,
            200,
            true,
            "Dispute details get successfully",
            { dispute }
        );
    } catch (error) {
        return give_response(res, 500, false, error.message);
    }
});

// export const updateEvidence = asyncHandler(async (req, res, next) => {
//     try {
//         const reqData = req.body
//         const validatedData = await updateEvidenceSchema(reqData)
//         const { disputeId, evidence } = validatedData

//     } catch (error) {
//         next(error)
//     }
// }) 

// export const addSupportMemberInDispute = asyncHandler(async (req, res) => {
//     try {
//         const { supportTeamUserId, agreementId } = req.body;
//         const support = await Support.findOne({_id: supportTeamUserId})

//         const AssignedAgent = {
//             agentId: supportTeamUserId,
//             fname: support.fname,
//             lname: support.lname,
//             email: support.email,
//         }

//         const dispute = await Dispute.findOneAndUpdate(
//             { agreementId },
//             { $set: { AssignedAgent } },
//             { new: true }
//         );
//         if (!dispute)
//             return give_response(res, 404, false, "dispute not found");

//         return give_response(
//             res,
//             200,
//             true,
//             "Support team member add successfully",
//             { dispute }
//         );
//     } catch (error) {
//         return give_response(res, 500, false, error.message);
//     }
// });
