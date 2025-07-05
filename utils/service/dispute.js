import Agreement from "../../models/Agreement.js";
import Dispute from "../../models/Dispute.js";
import SupportTeam from "../../models/SupportTeam.js";
import { generateDisputeId } from "./agreement.js";
import { notificationWhenStatusChange } from "./notification.js";

export const disputeAdd = async (validatedData, agreement) => {
    try {
        const {
            agreementId,
            reason,
            disputeCategory,
            evidence,
            connectedWallet,
        } = validatedData;
        
        const disputeCreator =
            connectedWallet === agreement.payerWallet ? "Payer" : "Receiver";

        let evidenceData = {};
        let reasons = {};
        if (disputeCreator === "Payer") {
            evidenceData.payerEvidence = evidence;
            reasons.payerReason = reason;
        } else {
            evidenceData.receiverEvidence = evidence;
            reasons.receiverReason = reason;
        }

        const dispute = await Dispute.create({
            agreementId,
            disputeId: await generateDisputeId(),
            status: "DisputeRaised",
            payerWalletAddress: agreement.payerWallet,
            receiverWalletAddress: agreement.receiverWallet,
            projectTitle: agreement.projectTitle,
            disputeCategory,
            disputeCreator,
            evidence: evidenceData,
            reasons,
        });

        await Promise.all([
            Agreement.findOneAndUpdate(
                { agreementId },
                { status: "Disputed" },
                { new: true }
            ),
            notificationWhenStatusChange(
                "Disputed",
                agreement,
                connectedWallet
            ),
        ]);

        return dispute;
    } catch (error) {
        throw error;
    }
};

export const evidenceAdd = async (validatedData, dispute) => {
    try {
        const { agreementId, evidence, reason, connectedWallet } =
            validatedData;

        const isPayer = connectedWallet === dispute.payerWalletAddress;
        const evidenceKey = isPayer ? "payerEvidence" : "receiverEvidence";
        const reasonKey = isPayer ? "payerReason" : "receiverReason";

        const updateField = {};
        if (evidence) {
            updateField[`evidence.${evidenceKey}`] = [
                ...(dispute.evidence?.[evidenceKey] || []),
                ...[].concat(evidence),
            ];
        }
        if (reason) {
            updateField[`reasons.${reasonKey}`] = reason;
        }
        updateField.status = "InProcess";
        updateField.date = updateField.date || {};
        updateField.date.responded = new Date();

        await Dispute.updateOne({ agreementId }, { $set: updateField });
        await Agreement.updateOne(
            { agreementId },
            { $set: { status: "InProcess" } }
        );
    } catch (error) {
        throw error;
    }
};

export const disputesByWalletId = async (connectedWalletId) => {
    try {
        const disputes = await Dispute.find({
            $or: [
                { payerWalletAddress: connectedWalletId },
                { receiverWalletAddress: connectedWalletId },
            ],
        });

        // const disputes = await Dispute.aggregate([
        //     {
        //         $match: {
        //             $or: [
        //                 { payerWalletAddress: connectedWalletId },
        //                 { receiverWalletAddress: connectedWalletId },
        //             ],
        //         },
        //     },
        //     // {
        //     //     $addFields: {
        //     //         evidenceData: {
        //     //             $cond: {
        //     //                 if: {
        //     //                     $eq: ["$payerWalletAddress", connectedWalletId],
        //     //                 }, // If the connected wallet is the payer
        //     //                 then: "$evidence.payerEvidence", // Use payerEvidence
        //     //                 else: {
        //     //                     $cond: {
        //     //                         if: {
        //     //                             $eq: [
        //     //                                 "$receiverWalletAddress",
        //     //                                 connectedWalletId,
        //     //                             ],
        //     //                         }, // If the connected wallet is the receiver
        //     //                         then: "$evidence.receiverEvidence", // Use receiverEvidence
        //     //                         else: [], // If neither, no evidence
        //     //                     },
        //     //                 },
        //     //             },
        //     //         },
        //     //     },
        //     // },
        //     {
        //         $project: {
        //             agreementId: 1,
        //             disputeId: 1,
        //             projectTitle: 1,
        //             payerWalletAddress: 1,
        //             receiverWalletAddress: 1,
        //             disputeCategory: 1,
        //             reasons: 1,
        //             disputeCreator: 1,
        //             AssignedAgent: 1,
        //             evidenceData: 1,
        //         },
        //     },
        // ]);

        return disputes;
    } catch (error) {
        throw error;
    }
};

// export const assignedAgent = async (disputeId) => {
//     try {
//         let agents;
//         agents = await SupportTeam.find({
//             assignedDispute: [],
//             status: "Free",
//         })

//         if (agents.length === 0) {
//             agents = await SupportTeam.find({ status: "Free" }).sort({
//                 lastAssignedAt: 1,
//             });

//             if (agents.length === 0) {
//                 agents = await SupportTeam.find({}).sort({
//                     lastAssignedAt: 1,
//                 });
//             }
//         }

//         const agent = agents[0]

//         await SupportTeam.updateOne(
//             { _id: agent._id },
//             {
//                 $push: { assignedDispute: disputeId },
//                 lastAssignedAt: new Date(),
//                 status: "Working",
//             }
//         );

//         const AssignedAgent = {
//             agentId: agent._id,
//             fname: agent.fname,
//             lname: agent.lname,
//             email: agent.email,
//         };
//         await Dispute.updateOne({ disputeId }, { $set: { AssignedAgent } });
//     } catch (error) {
//         throw error;
//     }
// };
