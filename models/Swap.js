import mongoose from "mongoose";

const swapSchema = new mongoose.Schema(
    {
        walletId: {
            type: String,
            required: true
        },
        fromChain: {
            type: String
        },
        toChain: {
            type: String
        },
        fromAmount: {
            type: String
        },
        toAmount: {
            type: String
        },
    },
    { timestamps: true }
);

const Swap = mongoose.model("Swap", swapSchema);

export default Swap;
