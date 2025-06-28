import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        walletId: {
            type: String
        },
        agreementId: {
            type: String
        },
        message: {
            type: String,
        },
        type: {
            type: String
        },
        read: {
            type: Boolean,
            default: false
        },
        // isImportant: {
        //     type: Boolean,
        //     default: false
        // },
        importantNotificationIsRead: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true, versionKey: false }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification
