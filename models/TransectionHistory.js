import mongoose from "mongoose";

const transection_historySchema = new mongoose.Schema(
    {
        chainId: {
            type: String
        },
        transactionHash: {
            type: String
        }, 
        gas: {
            type: String,
        },
        // gasPrice: {
        //     type: String
        // },
        transactionIndex: {
            type: Number
        },
        fromAddress: {
            type: String
        },
        toAddress: {
            type: String
        },
        value: {
            type: String
        },
        tokenName: {
            type: String
        },
        tokenSymbol: {
            type: String
        },
        tokenDecimals: {
            type: String
        },
        valueWithDecimals: {
            type: String
        },
        receiptStatus: {
            type: String
        },
        type: {
            type: String,
            enum: ["Deposit", "Withdrawal"],
            required: true 
        }
    },
    { timestamps: true, versionKey: false }
);

const TransectionHistory = mongoose.model("TransectionHistory", transection_historySchema);
export default TransectionHistory
