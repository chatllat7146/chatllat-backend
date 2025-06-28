import Agreement from "../../models/Agreement.js";
import Dispute from "../../models/Dispute.js";

export const addHashLink = async (hash, hashField, agreement) => {
    try {
        const updatedHashLink = {
            hashLink: { ...agreement.hashLink, [hashField]: hash },
        };
        const updatedAgreement = await Agreement.findOneAndUpdate(
            { agreementId: agreement.agreementId },
            updatedHashLink,
            { new: true }
        ).select("agreementId hashLink");

        return updatedAgreement;
    } catch (error) {
        throw error;
    }
};

export const fetchPaymentDetails = async (disputeId) => {
    try {
        const dispute = await Dispute.aggregate([
            {
                $match: { disputeId },
            },
            {
                $lookup: {
                    from: "agreements",
                    localField: "agreementId",
                    foreignField: "agreementId",
                    pipeline: [
                        {
                            $project: {
                                split: 1,
                                _id: 0,
                            },
                        },
                    ],
                    as: "agreement",
                },
            },
            {
                $unwind: {
                    path: "$agreement",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    agreementId: 1,
                    disputeId: 1,
                    status: 1,
                    assignStatus: 1,
                    projectTitle: 1,
                    payerWalletAddress: 1,
                    receiverWalletAddress: 1,
                    disputeCategory: 1,
                    evidence: 1,
                    reasons: 1,
                    disputeCreator: 1,
                    AssignedAgent: 1,
                    supportDecision: 1,
                    agreement: 1,
                },
            },
        ]);

        return dispute[0]
    } catch (error) {
        throw error;
    }
};
