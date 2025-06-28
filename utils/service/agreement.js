import Agreement from "../../models/Agreement.js";
import Chat from "../../models/Chat.js";
import { notificationWhenStatusChange } from "./notification.js";
import crypto from "crypto";

// generate AgreementId
export const generateAgreementId = async () => {
    try {
        const bytes = crypto.randomBytes(6); // 6 bytes = 12 hex digits ~ 18 decimal digits
        const number = BigInt("0x" + bytes.toString("hex"))
            .toString()
            .slice(0, 12);
        return number.padStart(12, "0");
    } catch (error) {
        throw error;
    }
};

// generate DisputeId
export const generateDisputeId = async () => {
    try {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const length = 6; // ID length

        // Generate a random 6-character ID
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }

        return result;
    } catch (error) {
        throw error;
    }
};

export const otp_genrator = (min, max) => {
    const otp = Math.floor(Math.random() * (max - min) + min);
    return otp;
};

export const dataReturnOnlyIfAgreementExist = async (agreementId) => {
    try {
        const agreement = await Agreement.findOne({ agreementId });
        return agreement;
    } catch (error) {
        throw error;
    }
};

export const walletAddressAdd = async (validatedData, agreement) => {
    try {
        const { walletAddress, agreementId, status, cancellationReason } =
            validatedData;

        let query =
            agreement.payerWallet === ""
                ? { payerWallet: walletAddress }
                : { receiverWallet: walletAddress };

        const updateData = {
            ...query,
            status,
            cancellationReason,
        };

        if (status === "Accepted") {
            updateData.agreementAcceptedDate = new Date(); // for check 72 hour ends or not
            updateData.lastAcceptedNotificationSentAt = new Date(); // prevent duplicate notification that day
        }

        const updatedAgreement = await Agreement.findOneAndUpdate(
            { agreementId },
            { $set: updateData },
            { new: true }
        );

        if (status == "Accepted" || status == "Negotiated") {
            const existingChat = await Chat.findOne({
                $or: [
                    {
                        sender: updatedAgreement.payerWallet,
                        receiver: updatedAgreement.receiverWallet,
                    },
                    {
                        sender: updatedAgreement.receiverWallet,
                        receiver: updatedAgreement.payerWallet,
                    },
                ],
            });

            if (!existingChat) {
                await Chat.create({
                    sender: updatedAgreement.payerWallet,
                    receiver: updatedAgreement.receiverWallet,
                    msg: "",
                });
            }
        }

        await notificationWhenStatusChange(
            status,
            updatedAgreement,
            walletAddress
        );

        return updatedAgreement;
    } catch (error) {
        throw error;
    }
};

export const agreementUpdate = async (validatedData, agreement) => {
    try {
        const {
            agreementId,
            payerDetails = {},
            receiverDetails = {},
            projectTitle,
            projectDescription,
            deadline,
            amountDetails = {},
            attachments,
        } = validatedData;

        const updatedData = {
            payerDetails: { ...agreement.payerDetails, ...payerDetails },
            receiverDetails: {
                ...agreement.receiverDetails,
                ...receiverDetails,
            },
            amountDetails: { ...agreement.amountDetails, ...amountDetails },
            projectTitle,
            projectDescription,
            deadline,
            attachments,
            status: "AgreementUpdated",
        };

        const updatedAgreement = await Agreement.findOneAndUpdate(
            { agreementId },
            updatedData,
            { new: true }
        );

        const connectedWalletId = updatedAgreement.role === 'Payer' ? updatedAgreement.payerWallet : updatedAgreement.receiverWallet
        await notificationWhenStatusChange(
            updatedData.status,
            agreement,
            connectedWalletId
        );

        return updatedAgreement;
    } catch (error) {
        throw error;
    }
};

export const personalDetailsAdd = async (validatedData, agreement) => {
    try {
        const { agreementId, details = {} } = validatedData;

        const isPayer = agreement.role === "Payer";
        const target = isPayer
            ? agreement.receiverDetails
            : agreement.payerDetails;
        const updatedField = isPayer ? "receiverDetails" : "payerDetails";

        const updatedData = { ...target, ...details };

        const updatedAgreement = await Agreement.findOneAndUpdate(
            { agreementId },
            { [updatedField]: updatedData },
            { new: true }
        );
        return updatedAgreement;
    } catch (error) {
        throw error;
    }
};
