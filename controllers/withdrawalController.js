import { ethers } from "ethers";
import give_response from "../helper/help.js";
import asyncHandler from "../helper/async.js";
import Agreement from "../models/Agreement.js";
import { signWithdrawal } from "../utils/service/withdrawal.js";
import { getSignatureSchema } from "../utils/validation/withdrawal_validation.js";

export const getSignature = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body
        const validatedData = await getSignatureSchema.validateAsync(reqData)
        const { address, agreementId } = validatedData;

        const agreement = await Agreement.findOne({ agreementId });
        if (!agreement)
            return give_response(res, 404, false, "Agreement not found");

        const decimal = agreement.amountDetails.chain == 'polygon' ? 6 : 18
        const amount = agreement.amountDetails.amount;
        const WithdrawalAmount = ethers.parseUnits(amount, decimal);

        // Validate address format
        if (!ethers.isAddress(address)) {
            return give_response(res, 400, false, "Invalid address format");
        }

        const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
        // Generate signature
        const signatureData = await signWithdrawal(
            address,
            WithdrawalAmount.toString(),
            adminPrivateKey
        );

        await Agreement.updateOne({ agreementId }, {$set: {status: "RequestedWithdrawal"}})

        const { signature, messageHash, signer } = signatureData;
        return give_response(res, 200, true, "", {
            amount: WithdrawalAmount.toString(),
            signature,
            messageHash,
            signer,
        });
    } catch (error) {
        next(error);
    }
});
