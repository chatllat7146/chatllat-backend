import Agreement from "../../models/Agreement.js";
import Dispute from "../../models/Dispute.js";

export const getMyTickets = async (validatedData) => {
    const {
        agentId,
        status,
        submittedBy,
        agreementId,
        disputeId,
        subject,
        startDate,
        endDate,
        sort,
    } = validatedData;

    const tickets = await Dispute.aggregate([
        {
            $match: {
                "AssignedAgent.agentId": agentId,
                ...(status && { status: status }), // Filter on status if provided
                ...(submittedBy && {
                    disputeCreator: submittedBy,
                }), // Filter on submittedBy if provided
                ...(agreementId && {
                    agreementId: {
                        $regex: agreementId,
                        $options: "i",
                    },
                }), // Search agreementId
                ...(disputeId && {
                    disputeId: {
                        $regex: disputeId,
                        $options: "i",
                    },
                }), // Search disputeId
                ...(subject && {
                    projectTitle: {
                        $regex: subject,
                        $options: "i",
                    },
                }), // Search projectTitle
                ...(startDate &&
                    endDate && {
                        createdAt: {
                            $gte: new Date(
                                new Date(startDate).setHours(0, 0, 0, 0)
                            ),
                            $lte: new Date(
                                new Date(endDate).setHours(23, 59, 59, 999)
                            ),
                        },
                    }),
            },
        },
        {
            $sort: {
                createdAt: sort === "ascending" ? 1 : -1, // Dynamically set sort order based on the request
            },
        },
        {
            $project: {
                _id: 1,
                agreementId: 1,
                disputeId: 1,
                status: 1,
                assignStatus: 1,
                projectTitle: 1,
                disputeCreator: 1,
                createdAt: 1,
            },
        },
    ]);

    return tickets;
};

export const allTickets = async (validatedData) => {
    const {
        status,
        submittedBy,
        AssignedAgent,
        agreementId,
        disputeId,
        subject,
        sort,
        startDate,
        endDate,
    } = validatedData;

    const dispute = await Dispute.aggregate([
        {
            $addFields: {
                AssignedAgent: {
                    $concat: [
                        { $ifNull: ["$AssignedAgent.fname", ""] }, // Handle null or missing fname
                        " ", // Add a space between first name and last name
                        { $ifNull: ["$AssignedAgent.lname", ""] }, // Handle null or missing lname
                    ],
                },
            },
        },
        {
            $match: {
                // Filter based on status, createdAt, agreementId, and disputeId
                ...(status && { status: status }), // Filter on status if provided
                ...(submittedBy && {
                    disputeCreator: submittedBy,
                }), // Filter on disputeCreator if provided
                ...(agreementId && {
                    agreementId: {
                        $regex: agreementId,
                        $options: "i",
                    },
                }), // Search agreementId
                ...(disputeId && {
                    disputeId: {
                        $regex: disputeId,
                        $options: "i",
                    },
                }), // Search disputeId
                ...(subject && {
                    projectTitle: {
                        $regex: subject,
                        $options: "i",
                    },
                }), // Search projectTitle
                ...(AssignedAgent && {
                    AssignedAgent: {
                        $regex: AssignedAgent,
                        $options: "i",
                    }, // Search for name (case-insensitive)
                }),
                ...(startDate &&
                    endDate && {
                        createdAt: {
                            $gte: new Date(
                                new Date(startDate).setHours(0, 0, 0, 0)
                            ),
                            $lte: new Date(
                                new Date(endDate).setHours(23, 59, 59, 999)
                            ),
                        },
                    }),
            },
        },
        {
            $sort: {
                createdAt: sort === "ascending" ? 1 : -1, // Dynamically set sort order based on the request
            },
        },
        {
            $project: {
                _id: 1,
                agreementId: 1,
                disputeId: 1,
                status: 1,
                assignStatus: 1,
                projectTitle: 1,
                disputeCreator: 1,
                AssignedAgent: 1,
                createdAt: 1,
            },
        },
    ]);

    return dispute;
};

export const getTicketDetails = async (disputeId) => {
    const dispute = await Dispute.aggregate([
        {
            $match: {
                disputeId,
            },
        },
        {
            $lookup: {
                from: "agreements",
                localField: "agreementId",
                foreignField: "agreementId",
                pipeline: [
                    {
                        $project: {
                            role: 1,
                            payerDetails: 1,
                            receiverDetails: 1,
                            projectDescription: 1,
                            attachments: 1,
                            status: 1,
                            amountDetails: 1,
                            createdAt: 1,
                        },
                    },
                ],
                as: "agreement",
            },
        },
    ]);

    return dispute[0];
};

export const getMyTicketDetails = async (ticketId) => {
    const ticket = await Dispute.aggregate([
        {
            $match: {
                disputeId: ticketId,
            },
        },
        {
            $lookup: {
                from: "agreements",
                localField: "agreementId",
                foreignField: "agreementId",
                pipeline: [
                    {
                        $project: {
                            role: 1,
                            payerDetails: 1,
                            receiverDetails: 1,
                            projectTitle: 1,
                            projectDescription: 1,
                            deadline: 1,
                            attachments: 1,
                            status: 1,
                            amountDetails: 1,
                            agreementAcceptedDate: 1,
                            createdAt: 1,
                        },
                    },
                ],
                as: "agreement",
            },
        },
    ]);

    return ticket[0];
};

export const splitAmount = async (validatedData, agreement) => {
    const { payerAmountPercent, receiverAmountPercent, decision } =
        validatedData;

    const totalAmount = agreement.amountDetails.amount;

    const payerAmount = (totalAmount * payerAmountPercent) / 100;
    const receiverAmount = (totalAmount * receiverAmountPercent) / 100;

    const split = {
        payerAmount,
        receiverAmount,
        payerPercentage: payerAmountPercent,
        receiverPercentage: receiverAmountPercent,
    };
    const updatedAgreement = await Agreement.findOneAndUpdate(
        { agreementId: agreement.agreementId },
        {
            $set: {
                split,
                status: "DisputeResolved",
            },
        },
        { new: true }
    );

    await Dispute.updateOne(
        { agreementId: agreement.agreementId },
        {
            $set: {
                assignStatus: "Resolved",
                status: "Resolved",
                supportDecision: decision,
            },
        }
    );

    return updatedAgreement;
};
