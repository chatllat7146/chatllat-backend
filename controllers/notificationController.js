import asyncHandler from "../helper/async.js";
import Notification from "../models/Notification.js";
import give_response from "../helper/help.js";

export const getNotification = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params
        const notification = await Notification.find({ walletId: id })
        await Notification.updateMany({ walletId: id }, {$set: {read: true}})
        return give_response(res, 200, true, "Notification get successfully", { notification });

    } catch (error) {
        next(error);
    }
})


// export const getNotification = asyncHandler(async (req, res, next) => {
//     try {
//         const { id } = req.params
//         const notification = await Notification.find({ walletId: id })
//         await Notification.updateMany({ walletId: id, type: {$ne: "Deposit Funds"} }, {$set: {read: true}})
//         return give_response(res, 200, true, "Notification get successfully", { notification });

//     } catch (error) {
//         return give_response(res, 500, false, error.message);
//     }
// })



