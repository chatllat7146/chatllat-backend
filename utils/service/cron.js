import cron from "node-cron";
import Agreement from "../../models/Agreement.js";
import Dispute from "../../models/Dispute.js";
import {
    cronNotification,
    notificationWhenStatusChange,
} from "./notification.js";
import Notification from "../../models/Notification.js";
import { generateDisputeId } from "./agreement.js";

const sendFundDepositNotification = async () => {
    try {
        cron.schedule("0 10 * * *", async () => {
            console.log("cron run every day 10:00 am");

            const now = new Date();
            const cutoffDate = new Date(now.getTime() - 72 * 60 * 60 * 1000); // 72 hours ago

            // 1. Send notification for deposit funds
            // Get agreements accepted within the last 72 hours.
            const agreements = await Agreement.find({
                status: "Accepted",
                agreementAcceptedDate: { $gte: cutoffDate },
            });

            for (const agreement of agreements) {
                const lastNotified = agreement.lastAcceptedNotificationSentAt;

                const alreadyNotifiedToday =
                    lastNotified &&
                    new Date(lastNotified).toDateString() ===
                        now.toDateString();

                const acceptedToday =
                    agreement.agreementAcceptedDate &&
                    new Date(agreement.agreementAcceptedDate).toDateString() ===
                        now.toDateString();

                if (!alreadyNotifiedToday && !acceptedToday) {
                    await cronNotification(agreement);
                    agreement.lastAcceptedNotificationSentAt = now;
                    agreement.save();
                }
            }

            // 2. important notification for Deposit Funds set read true
            // Additional logic for agreements where 72 hours have passed
            const overdueAgreements = await Agreement.find({
                status: "Accepted",
                agreementAcceptedDate: { $lt: cutoffDate },
            });

            for (const agreement of overdueAgreements) {
                await Notification.updateMany(
                    {
                        agreementId: agreement.agreementId,
                        type: "Deposit Funds",
                        read: true,
                        importantNotificationIsRead: false,
                    },
                    {
                        $set: { importantNotificationIsRead: true },
                    },
                    {
                        new: true,
                    }
                );
            }

            // 3. Create dispute if work was submitted but payment not released within 72 hours
            // Additional logic for agreements where 72 hours have passed
            const workDoneAgreements = await Agreement.find({
                workSubmittedDate: { $lt: cutoffDate },
                status: "WorkSubmitted",
            });

            for (const agreement of workDoneAgreements) {
                const dispute = await Dispute.findOne({
                    agreementId: agreement.agreementId,
                });

                if (!dispute) {
                    await Dispute.create({
                        agreementId: agreement.agreementId,
                        disputeId: await generateDisputeId(),
                        status: "DisputeRaised",
                        payerWalletAddress: agreement.payerWallet,
                        receiverWalletAddress: agreement.receiverWallet,
                        projectTitle: agreement.projectTitle,
                        reasons: {
                            autoCreatedReason:
                                "Payment not released within 72 hours of work submission",
                        },
                        disputeCategory: "Payment Not Released",
                        disputeCreator: "Auto",
                    });

                    await notificationWhenStatusChange(
                        "AutoDisputed",
                        agreement,
                        ""
                    );
                }
            }
        });
    } catch (error) {
        console.log(error);
    }
};

// const sendFundDepositNotification = async () => {
//     try {
//         cron.schedule("0 9 * * *", async () => {
//             console.log("cron run every day 9:00 am");

//             const now = new Date();
//             const cutoffDate = new Date(now.getTime() - 72 * 60 * 60 * 1000); // 72 hours ago

//             // Get agreements accepted within the last 72 hours
//             const agreements = await Agreement.find({
//                 status: "Accepted",
//                 agreementAcceptedDate: { $gte: cutoffDate }
//             });

//             for (const agreement of agreements) {
//                 const lastNotified = agreement.lastAcceptedNotificationSentAt;

//                 const alreadyNotifiedToday = lastNotified &&
//                     new Date(lastNotified).toDateString() === now.toDateString();

//                 const acceptedToday =
//                     agreement.agreementAcceptedDate &&
//                     new Date(agreement.agreementAcceptedDate).toDateString() === now.toDateString();

//                 if (!alreadyNotifiedToday && !acceptedToday) {
//                     await cronNotification(agreement)
//                     agreement.lastAcceptedNotificationSentAt = now
//                     agreement.save()
//                 }
//             }
//         });
//     } catch (error) {
//         console.log(error);
//     }
// }

export default sendFundDepositNotification;
