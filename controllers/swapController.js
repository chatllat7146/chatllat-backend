import give_response from "../helper/help.js";
import Swap from "../models/Swap.js";
import asyncHandler from "../helper/async.js";

export const swapAmount = asyncHandler(async (req, res, next) => {
    try {
        const { walletId, fromChain, toChain, fromAmount, toAmount } = req.body  
        const swap = await Swap.create({walletId, fromChain, toChain, fromAmount, toAmount})
        give_response(res, 200, true, "Amount swap successfully!", swap)

    } catch (error) {
       next(error);
    }
});