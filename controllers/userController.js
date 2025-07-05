import asyncHandler from "../helper/async.js";
import User from "../models/User.js";
import give_response from "../helper/help.js";
import { dataReturnOnlyIfAgreementExist } from "../utils/service/agreement.js";
import {
    createProfileSchema,
    updateUserSchema,
} from "../utils/validation/user_validation.js";

export const createProfile = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const validatedData = await createProfileSchema.validateAsync(reqData);
        const { walletId, avatar } = validatedData;
        let user;
        user = await User.findOne({ walletId });
        if (!user) {
            user = await User.create({ walletId, profileImage: avatar });
        }
        return give_response(res, 200, true, "User created successfully", {
            user,
        });
    } catch (error) {
        next(error);
    }
});

export const updateProfile = asyncHandler(async (req, res, next) => {
    try {
        const reqData = req.body;
        const validatedData = await updateUserSchema.validateAsync(reqData);
        const { walletId, profileImage, name, email, contact, description } =
            validatedData;

        const user = await User.findOne({ walletId });
        if (!user) return give_response(res, 404, false, "User not found");

        const updatedUser = await User.findOneAndUpdate(
            { walletId },
            { profileImage, name, email, contact, description },
            { new: true }
        );
        return give_response(res, 200, true, "User updated successfully", {
            updatedUser,
        });
    } catch (error) {
       next(error);
    }
});

export const addRating = asyncHandler(async (req, res, next) => {
    try {
        const { agreementId, connectedWalletId, ratings } = req.body;

        const agreement = await dataReturnOnlyIfAgreementExist(agreementId);
        if (!agreement)
            return give_response(res, 404, false, "Agreement not found");

        let walletId = "";
        if (connectedWalletId === agreement.payerWallet) {
            walletId = agreement.receiverWallet;
        } else {
            walletId = agreement.payerWallet;
        }

        await User.updateOne(
            { walletId },
            { $push: { ratings } },
            { new: true }
        );
        return give_response(res, 200, true, "Rating added successfully", {});
    } catch (error) {
        next(error);
    }
});

export const getProfile = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await User.aggregate([
            { $match: { walletId: id } },
            {
                $project: {
                    walletId: 1,
                    name: 1,
                    email: 1,
                    contact: 1,
                    description: 1,
                    profileImage: 1,
                    avgRating: { $avg: "$ratings" },
                    _id: 0,
                },
            },
        ]);

        return give_response(res, 200, true, "Profile get successfully", {
            user: result[0],
        });
    } catch (error) {
        next(error);
    }
});
