import asyncHandler from "../helper/async.js";
import give_response from "../helper/help.js";
import Chat from "../models/Chat.js";
import Dispute from "../models/Dispute.js";
import Agreement from "../models/Agreement.js";
import GroupChat from "../models/GroupChat.js";

export const createGroupChat = asyncHandler(async (req, res, next) => {
    try {
        const { agreementId } = req.body;

        // Check if group chat already exists for the agreement
        const existingGroupChat = await GroupChat.findOne({
            groupId: agreementId,
        });

        let groupChat;
        if (!existingGroupChat) {
            const dispute = await Dispute.findOne({ agreementId });
            const agreement = await Agreement.findOne({ agreementId });

            groupChat = await GroupChat.create({
                groupId: agreementId,
                groupName: `Dispute Resolve - ${agreement.projectTitle}`,
                groupMember: [
                    dispute.payerWalletAddress,
                    dispute.receiverWalletAddress,
                    dispute.AssignedAgent.agentId,
                ],
            });
        }

        return give_response(res, 200, true, "Group chat create successfully", {
            groupChat,
        });
    } catch (error) {
       next(error);
    }
});

export const getChatList = asyncHandler(async (req, res, next) => {
    const userId = req.query.connectedWalletId;
    
    try {
        const chatList = await Chat.aggregate([
            {
                $match: {
                    $or: [
                        { sender: userId },
                        { receiver: userId },
                        { groupMember: userId },
                    ],
                },
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$sender", userId] }, // If the logged-in user is the sender
                            then: "$receiver", // Group by receiver (the other person)
                            else: "$sender", // If the logged-in user is the receiver
                        },
                    },
                    lastMessage: { $last: "$$ROOT" }, // Get the last message in the conversation
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $eq: ["$isGroup", true] }, // If it's a group chat
                                {
                                    $cond: {
                                        if: {
                                            $in: [userId, "$groupMsgReadBy"], // Check if userId is in the groupMsgReadBy array
                                        },
                                        then: 0, // If user has read the message, do nothing
                                        else: 1, // If user hasn't read, increment the unread count
                                    },
                                },
                                {
                                    $cond: {
                                        if: { $eq: ["$read", false] }, // If it's a personal chat and the message is unread
                                        then: 1,
                                        else: 0,
                                    },
                                },
                            ],
                        },
                    },
                },
            },
            {
                $project: {
                    userId: "$_id",
                    message: "$lastMessage.msg",
                    image: "$lastMessage.image",
                    document: "$lastMessage.document",
                    isGroup: "$lastMessage.isGroup",
                    groupName: "$lastMessage.groupName",
                    groupId: "$lastMessage.groupId",
                    createdAt: "$lastMessage.createdAt",
                    unreadCount: 1, // Include unread message count in the result
                },
            },
        ]);

        res.json({
            success: true,
            chatList: chatList,
        });
    } catch (error) {
        next(error);
    }
});

export const getPersonalChatMessages = asyncHandler(async (req, res, next) => {
    try {
        const { sender, receiver } = req.query;
        await Chat.updateMany(
            { sender: receiver, receiver: sender },
            { read: true }
        );

        const messages = await Chat.find({
            $or: [
                { sender: sender, receiver: receiver },
                { sender: receiver, receiver: sender },
            ],
        });
        return give_response(res, 200, true, "Messages get successfully", {
            messages,
        });
    } catch (error) {
        next(error);
    }
});

export const getChatMessages = asyncHandler(async (req, res, next) => {
    try {
        const { sender, receiver, groupId } = req.query; // sender id = connected wallet id

        let messages;
        if (groupId) {
            await Chat.updateOne(
                {
                    isGroup: true,
                    groupMsgReadBy: { $ne: sender },
                },
                {
                    $push: { groupMsgReadBy: sender }, // Push userId to the readBy array
                }
            );

            messages = await Chat.aggregate([
                {
                    $match: {
                        isGroup: true,
                        groupId,
                    },
                },
                {
                    $addFields: {
                        read: {
                            $cond: {
                                if: {
                                    $in: [sender, "$groupMsgReadBy"], // Check if sender is in groupMsgReadBy
                                },
                                then: true,
                                else: false,
                            },
                        },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        msg: 1,
                        image: 1,
                        document: 1,
                        read: 1,
                        isGroup: 1,
                        groupId: 1,
                        groupName: 1,
                        groupMember: 1,
                        groupMsgReadBy: 1,
                        createdAt: 1,
                    },
                },
            ]);
        } else {
            await Chat.updateMany(
                { sender: receiver, receiver: sender },
                { read: true }
            );

            messages = await Chat.find({
                $or: [
                    { sender: sender, receiver: receiver },
                    { sender: receiver, receiver: sender },
                ],
            }).select("sender receiver msg image document read createdAt");
        }

        return give_response(res, 200, true, "Messages get successfully", {
            messages,
        });
    } catch (error) {
        next(error);
    }
});
