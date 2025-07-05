import Agreement from "../models/Agreement.js";
import User from "../models/User.js";
import {
    addPersonalDetailsSchema,
    addWalletAddressSchema,
    agreementIdSchema,
    cancelAgreementSchema,
    createAgreementSchema,
    updateAgreementSchema,
} from "../utils/validation/agreement_validation.js";
import {
    createNotification,
    notificationWhenStatusChange,
} from "../utils/service/notification.js";
import asyncHandler from "../helper/async.js";
import give_response from "../helper/help.js";
import {
    agreementUpdate,
    dataReturnOnlyIfAgreementExist,
    generateAgreementId,
    personalDetailsAdd,
    walletAddressAdd,
} from "../utils/service/agreement.js";

export const createNewAgreement = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const validatedData = await createAgreementSchema.validateAsync(
            reqData
        );

        const {
            role,
            creatorWallet,
            payerDetails,
            receiverDetails,
            projectTitle,
            projectDescription,
            deadline,
            attachments,
            amountDetails,
        } = validatedData;

        // Generate unique agreement ID
        const agreementId = await generateAgreementId();

        let query =
            role === "Payer"
                ? { payerWallet: creatorWallet }
                : { receiverWallet: creatorWallet };

        // Create new agreement
        const newAgreement = new Agreement({
            agreementId,
            role,
            ...query,
            payerDetails,
            receiverDetails,
            projectTitle,
            projectDescription,
            amountDetails,
            deadline: new Date(deadline),
            attachments: attachments,
            status: "Created",
            actions: [
                {
                    action: "Created",
                    performedBy: creatorWallet,
                    details: `Agreement created by ${role}`,
                },
            ],
        });

        const savedAgreement = await newAgreement.save();
        const notificationType = "create agreement";
        const message = "agreement created successfully";
        await createNotification(
            creatorWallet,
            agreementId,
            notificationType,
            message
        );

        return res.status(201).json({
            success: true,
            agreement: savedAgreement,
            shareableLink: `${req.protocol}://${req.get(
                "host"
            )}/view-agreement/${agreementId}`,
            newShareLink: `http://localhost:5174/agreements/${agreementId}`
        });
    } catch (error) {
        next(error);
    }
});

export const getAgreementById = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;
        const agreement = await Agreement.findOne({
            agreementId: id,
            status: { $ne: "Rejected" },
        });

        if (!agreement) {
            return res.status(404).json({
                success: false,
                message: "Agreement not found",
            });
        }

        return res.status(200).json({
            success: true,
            agreement,
        });
    } catch (error) {
        next(error);
    }
});

export const getAllAgreement = asyncHandler(async (req, res, next) => {
    try {
        const { walletAddress } = req.params;

        const agreements = await Agreement.find({
            $or: [
                { payerWallet: walletAddress },
                { receiverWallet: walletAddress },
            ],
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            agreements,
        });
    } catch (error) {
        next(error);
    }
});

export const addWalletAddress = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const validatedData = await addWalletAddressSchema.validateAsync(
            reqData
        );
        const { agreementId } = validatedData;

        const agreement = await dataReturnOnlyIfAgreementExist(agreementId);
        if (!agreement)
            return res
                .status(404)
                .json({ success: false, message: "Agreement not found" });

        const updatedAgreement = await walletAddressAdd(
            validatedData,
            agreement
        );

        return res.status(200).json({
            success: true,
            updatedAgreement,
        });
    } catch (error) {
        next(error);
    }
});

export const updateAgreementDetails = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const validatedData = await updateAgreementSchema.validateAsync(
            reqData
        );
        const { agreementId } = validatedData;

        const agreement = await dataReturnOnlyIfAgreementExist(agreementId);
        if (!agreement)
            return res
                .status(404)
                .json({ success: false, message: "Agreement not found" });
        if (agreement.status !== "Negotiated")
            return res.status(400).json({
                success: false,
                message: "You are not able to update agreement",
            });

        const updatedAgreement = await agreementUpdate(
            validatedData,
            agreement
        );

        return give_response(res, 200, true, "Agreement updated successfully", {
            updatedAgreement,
        });
    } catch (error) {
        next(error);
    }
});

export const addPersonalDetails = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const validatedData = await addPersonalDetailsSchema.validateAsync(
            reqData
        );
        const { agreementId } = validatedData;

        const agreement = await dataReturnOnlyIfAgreementExist(agreementId);
        if (!agreement)
            return give_response(res, 404, false, "Agreement not found");

        const updatedAgreement = await personalDetailsAdd(
            validatedData,
            agreement
        );

        return give_response(res, 200, true, "Details updated successfully", {
            updatedAgreement,
        });
    } catch (error) {
        next(error);
    }
});

export const requestDeposit = asyncHandler(async (req, res, next) => {
    try {
        // change status = RequestedDeposit
        const reqData = req.body;
        const validatedData = await agreementIdSchema.validateAsync(reqData);
        const { agreementId } = validatedData;

        const agreement = await Agreement.findOne({
            agreementId,
            status: "Accepted",
        });
        if (!agreement)
            return give_response(res, 404, false, "Agreement not found");

        const updatedAgreement = await Agreement.findOneAndUpdate(
            { agreementId },
            { $set: { status: "RequestedDeposit" } },
            { new: true }
        );
        return give_response(res, 200, true, "Status updated successfully", {
            agreement: updatedAgreement,
        });
    } catch (error) {
        next(error);
    }
});

// export const requestWithdrawal = asyncHandler(async (req, res, next) => {
//     try {
//         // change status = RequestedWithdrawal
//         const reqData = req.body;
//         const validatedData = await agreementIdSchema.validateAsync(reqData);
//         const { agreementId } = validatedData;

//         const agreement = await Agreement.findOne({
//             agreementId,
//             status: "FundsReleased",
//         });
//         if (!agreement)
//             return give_response(res, 404, false, "Agreement not found");

//         const updatedAgreement = await Agreement.findOneAndUpdate(
//             { agreementId },
//             { $set: { status: "RequestedWithdrawal" } },
//             { new: true }
//         );
//         return give_response(res, 200, true, "Status updated successfully", {
//             agreement: updatedAgreement,
//         });
//     } catch (error) {
//         return give_response(res, 500, false, error.message);
//     }
// });

// change status = WorkSubmitted when work as done
export const setWorkSubmittedStatus = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const validatedData = await agreementIdSchema.validateAsync(reqData);
        const { agreementId } = validatedData;

        const agreement = await Agreement.findOne({
            agreementId,
            status: "EscrowFunded",
        });
        if (!agreement)
            return give_response(res, 404, false, "Agreement not found");

        const updatedAgreement = await Agreement.findOneAndUpdate(
            { agreementId },
            {
                $set: {
                    status: "WorkSubmitted",
                    WorkSubmittedDate: new Date(),
                },
            },
            { new: true }
        );
        await notificationWhenStatusChange(
            "WorkSubmitted",
            updatedAgreement,
            ""
        );

        return give_response(res, 200, true, "Status updated successfully", {
            updatedAgreement,
        });
    } catch (error) {
        next(error);
    }
});

// change status = FundsReleased when WorkSubmitted
export const setFundsReleasedStatus = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const validatedData = await agreementIdSchema.validateAsync(reqData);
        const { agreementId } = validatedData;

        const agreement = await Agreement.findOne({
            agreementId,
            status: "WorkSubmitted",
        });
        if (!agreement)
            return give_response(res, 404, false, "Agreement not found");

        const updatedAgreement = await Agreement.findOneAndUpdate(
            { agreementId },
            { $set: { status: "FundsReleased" } },
            { new: true }
        );
        await notificationWhenStatusChange(
            "FundsReleased",
            updatedAgreement,
            ""
        );
        return give_response(res, 200, true, "Status updated successfully", {
            updatedAgreement,
        });
    } catch (error) {
        next(error);
    }
});

//  get Disputed status agreement data
export const getDisputedStatusAgreement = asyncHandler(async (req, res, next) => {
    try {
        const { connectedWalletId } = req.query;
        const agreements = await Agreement.find({
            $or: [
                { payerWallet: connectedWalletId },
                { receiverWallet: connectedWalletId },
            ],
            // status: "Disputed",
            status: { $in: ["Disputed", "InProcess"] },
        });
        return give_response(res, 200, true, "Agreements get successfully", {
            agreements,
        });
    } catch (error) {
        next(error);
    }
});

// Get Withdrawal Agreement Data
export const getWithdrawalAgreement = asyncHandler(async (req, res, next) => {
    try {
        const { connectedWalletId } = req.query;
        const agreements = await Agreement.aggregate([
            {
                $match: {
                    $or: [
                        {status: "FundsReleased", receiverWallet: connectedWalletId},
                        {status: "ReturnFunds", payerWallet: connectedWalletId},
                    ],
                },
            },
            {
                $project: {
                    payerWallet: 1,
                    receiverWallet: 1,
                    projectTitle: 1,
                    agreementId: 1,
                    status: 1,
                    amountDetails: 1,
                },
            },
        ]);

        return give_response(
            res,
            200,
            true,
            "Withdrawal agreements retrieved successfully",
            { agreements }
        );
    } catch (error) {
        next(error);
    }
});

// export const getWithdrawalAgreement = asyncHandler(async (req, res, next) => {
//     try {
//         const { connectedWalletId } = req.query;

//         const agreements = await Agreement.aggregate([
//             {
//                 $match: {
//                     status: "FundsReleased",
//                     $or: [
//                         { payerWallet: connectedWalletId },
//                         { receiverWallet: connectedWalletId },
//                     ],
//                 },
//             },
//             {
//                 $addFields: {
//                     amount: {
//                         $cond: {
//                             if: { $eq: ["$payerWallet", connectedWalletId] },
//                             then: {
//                                 $toDouble: "$split.payerAmount", // Convert payerAmount to a number
//                             },
//                             else: {
//                                 $cond: {
//                                     if: {
//                                         $and: [
//                                             {
//                                                 $eq: [
//                                                     {
//                                                         $toDouble:
//                                                             "$split.payerAmount",
//                                                     },
//                                                     0,
//                                                 ],
//                                             }, // Convert to number before comparing
//                                             {
//                                                 $eq: [
//                                                     {
//                                                         $toDouble:
//                                                             "$split.receiverAmount",
//                                                     },
//                                                     0,
//                                                 ],
//                                             }, // Convert to number before comparing
//                                         ],
//                                     },
//                                     then: {
//                                         $toDouble: "$amountDetails.amount", // Convert string amount to a number
//                                     },
//                                     else: {
//                                         $toDouble: "$split.receiverAmount", // Convert receiverAmount to a number
//                                     },
//                                 },
//                             },
//                         },
//                     },
//                 },
//             },
//             {
//                 $project: {
//                     payerWallet: 1,
//                     receiverWallet: 1,
//                     projectTitle: 1,
//                     agreementId: 1,
//                     amountDetails: 1,
//                 },
//             },
//         ]);

//         return give_response(
//             res,
//             200,
//             true,
//             "Withdrawal agreements retrieved successfully",
//             { agreements }
//         );
//     } catch (error) {
//         return give_response(res, 500, false, error.message);
//     }
// });

export const cancelAgreement = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const validatedData = await cancelAgreementSchema.validateAsync(
            reqData
        );
        const { agreementId, cancellationReason, connectedWalletId } =
            validatedData;

        const agreement = await Agreement.findOne({ agreementId });
        if (!agreement)
            return give_response(res, 404, false, "Agreement not found");

        const cancelledBy =
            connectedWalletId === agreement.payerWallet ? "Payer" : "Receiver";
        const status =
            cancelledBy === "Payer" || agreement.status !== "EscrowFunded"
                ? "Rejected"
                : "ReturnFunds";

        await Agreement.updateOne(
            { agreementId },
            { $set: { status, cancellationReason } }
        );

        return give_response(
            res,
            200,
            true,
            "Agreement cancelled successfully",
            { agreement }
        );
    } catch (error) {
        next(error);
    }
});
