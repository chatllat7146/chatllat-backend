import asyncHandler from "../helper/async.js";
import give_response from "../helper/help.js";
import Agreement from "../models/Agreement.js";
import Notification from "../models/Notification.js";
import TransectionHistory from "../models/TransectionHistory.js";
import { parseUnits } from "ethers";

async function getTransectionData(reqData) {
    try {
        const transectionData = {
            chainId: reqData.chainId,
            transactionHash: reqData.erc20Transfers[0].transactionHash,
            gas: reqData.txs[0].gas,
            // gasPrice: reqData.txs[0].gasPrice,
            transactionIndex: reqData.txs[0].transactionIndex,
            fromAddress: reqData.erc20Transfers[0].from,
            toAddress: reqData.erc20Transfers[0].to,
            value: reqData.erc20Transfers[0].value,
            tokenName: reqData.erc20Transfers[0].tokenName,
            tokenSymbol: reqData.erc20Transfers[0].tokenSymbol,
            tokenDecimals: reqData.erc20Transfers[0].tokenDecimals,
            valueWithDecimals: reqData.erc20Transfers[0].valueWithDecimals,
            receiptStatus: reqData.txs[0].receiptStatus,
        };

        return transectionData;
    } catch (error) {
        throw error;
    }
}

async function getWithdrawalData(reqData) {
    try {
        const withdrawalData = {
            chainId: reqData.chainId,
            transactionHash: reqData.txs[0].hash,
            gas: reqData.txs[0].gas,
            // gasPrice: reqData.txs[0].gasPrice,
            transactionIndex: reqData.txs[0].transactionIndex,
            fromAddress: reqData.txs[0].fromAddress,
            toAddress: reqData.txs[0].toAddress,
            value: reqData.erc20Transfers[0].value,
            tokenName: reqData.erc20Transfers[0].tokenName,
            tokenSymbol: reqData.erc20Transfers[0].tokenSymbol,
            tokenDecimals: reqData.erc20Transfers[0].tokenDecimals,
            valueWithDecimals: reqData.erc20Transfers[0].valueWithDecimals,
            receiptStatus: reqData.txs[0].receiptStatus,
        };

        return withdrawalData;
    } catch (error) {
        throw error;
    }
}

async function matchAmount(agreementAmount, transectionAmount, tokenDecimals) {
    try {
        const expectedBNB = agreementAmount;
        const expectedWei = parseUnits(expectedBNB, 18);
        const actualValue = transectionAmount;
        const actualDecimals = Number(tokenDecimals);
        const actualWei =
            BigInt(actualValue) * 10n ** BigInt(18 - actualDecimals);

        console.log(expectedWei, "expectedWei");
        console.log(actualWei, "actualWei");

        return { expectedWei, actualWei };
    } catch (error) {
        throw error;
    }
}

async function updateDataWhenFundsIsDeposit(
    expectedWei,
    actualWei,
    agreementId,
    obj
) {
    try {
        if (expectedWei === actualWei) {
            console.log("✅ Amount matches!");

            await Agreement.updateOne(
                { agreementId },
                {
                    $set: {
                        status: "EscrowFunded",
                        dipositHash: obj.transactionHash,
                    },
                }
            );

            obj.type = "Deposit";
            await TransectionHistory.create(obj);

            await Notification.updateMany(
                {
                    agreementId,
                    type: "Deposit Funds",
                    read: true,
                },
                { $set: { importantNotificationIsRead: true } }
            );
        } else {
            console.log("amount mismatch");
        }
    } catch (error) {
        throw error;
    }
}

async function updateDataWhenFundsIsWithdraw(
    expectedWei,
    actualWei,
    agreementId,
    obj
) {
    try {
        if (expectedWei === actualWei) {
            console.log("✅ Amount matches!");

            await Agreement.updateOne(
                { agreementId },
                {
                    $set: {
                        status: "Completed",
                        withdrwalHash: obj.transactionHash,
                    },
                }
            );

            obj.type = "Withdrawal";
            await TransectionHistory.create(obj);
        } else {
            console.log("amount mismatch");
        }
    } catch (error) {
        throw error;
    }
}

export const transectionConfirmation = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        console.log(reqData, "req.body======");

        if (reqData.confirmed == true) {
            if (reqData.erc20Transfers[0].to == process.env.ADMIN_WALLET_ID) {
                // for deposit
                const obj = await getTransectionData(reqData);
                console.log(obj, "obj====");

                const agreement = await Agreement.findOne({
                    status: "RequestedDeposit",
                    payerWallet: obj.fromAddress,
                });

                if (agreement) {
                    console.log(agreement.agreementId, "agreement===");
                    const { expectedWei, actualWei } = await matchAmount(
                        agreement.amountDetails.amount,
                        obj.value,
                        obj.tokenDecimals
                    );
                    await updateDataWhenFundsIsDeposit(
                        expectedWei,
                        actualWei,
                        agreement.agreementId,
                        obj
                    );
                }
            }

            if (reqData.erc20Transfers[0].from == process.env.ADMIN_WALLET_ID) {
                // for withdrawal
                const obj = await getWithdrawalData(reqData);
                console.log(obj, "obj====");

                const withdrawalAgreement = await Agreement.findOne({
                    status: "RequestedWithdrawal",
                    receiverWallet: obj.fromAddress,
                    // receiverWallet: obj.toAddress,
                });

                if (withdrawalAgreement) {
                    console.log(
                        withdrawalAgreement.agreementId,
                        "withdrawalAgreement"
                    );

                    const { expectedWei, actualWei } = await matchAmount(
                        withdrawalAgreement.amountDetails.amount,
                        obj.value,
                        obj.tokenDecimals
                    );
                    await updateDataWhenFundsIsWithdraw(
                        expectedWei,
                        actualWei,
                        withdrawalAgreement.agreementId,
                        obj
                    );
                }
            }
        }

        return give_response(res, 200, true, "webhook called", {});
    } catch (error) {
        next(error);
    }
});

// export const transectionConfirmation = asyncHandler(async (req, res, next) => {
//     try {
//         const reqData = req.body
//         console.log(reqData, "req.body======");
//         // console.log(reqData.txs[0].triggered_by, "======111");

//         if (reqData.confirmed == true) {
//             const obj = {
//                 chainId: reqData.chainId,
//                 transactionHash: reqData.erc20Transfers[0].transactionHash,
//                 gas: reqData.txs[0].gas,
//                 // gasPrice: reqData.txs[0].gasPrice,
//                 transactionIndex: reqData.txs[0].transactionIndex,
//                 fromAddress: reqData.erc20Transfers[0].from,
//                 toAddress: reqData.erc20Transfers[0].to,
//                 value: reqData.erc20Transfers[0].value,
//                 tokenName: reqData.erc20Transfers[0].tokenName,
//                 tokenSymbol: reqData.erc20Transfers[0].tokenSymbol,
//                 tokenDecimals: reqData.erc20Transfers[0].tokenDecimals,
//                 valueWithDecimals: reqData.erc20Transfers[0].valueWithDecimals,
//                 receiptStatus: reqData.txs[0].receiptStatus,
//             }

//             console.log(obj, "obj====");
//             const agreement = await Agreement.findOne({ status: "RequestedDeposit", payerWallet: obj.fromAddress })
//             if (!agreement) return give_response(res, 404, false, "Agreement not found");
//             console.log(agreement.agreementId, "agreement===");

//             // const withdrawalAgreement = await Agreement.findOne({ status: "RequestedWithdrawal", receiverWallet: obj.toAddress })
//             // console.log(withdrawalAgreement.agreementId, "withdrawalAgreement===");
//             // if(withdrawalAgreement){}

//             const expectedBNB = agreement.amountDetails.amount; // e.g. "5"
//             // Convert to BigInt in 18 decimals (standard for ETH-compatible tokens)
//             const expectedWei = parseUnits(expectedBNB, 18); // BigInt
//             // Get actual value and token decimals from webhook
//             const actualValue = obj.value; // e.g. "5000000"
//             const actualDecimals = Number(obj.tokenDecimals); // e.g. 6
//             const actualWei = BigInt(actualValue) * 10n ** BigInt(18 - actualDecimals);

//             // Compare
//             if (expectedWei === actualWei) {
//                 console.log("✅ Amount matches!");
//                 await Agreement.findOneAndUpdate({ agreementId: agreement.agreementId }, { $set: { status: "EscrowFunded", dipositHash: obj.transactionHash } }, { new: true });
//                 await TransectionHistory.create(obj);
//                 await Notification.updateMany({ agreementId: agreement.agreementId, type: "Deposit Funds", read: true }, { $set: { importantNotificationIsRead: true } })
//             } else {
//                 console.log("amount mismatch");
//             }
//         }
//         return give_response(res, 200, true, "webhook called", {});
//     } catch (error) {
//         return give_response(res, 500, false, error.message);
//     }
// })

// const expectedBNB = agreement.amountDetails.amount
// const expectedWei = parseUnits(expectedBNB, 18); // returns bigint
// const actualValueFromWebhook = obj.value; // from webhook
// const actualWei = BigInt(actualValueFromWebhook);
