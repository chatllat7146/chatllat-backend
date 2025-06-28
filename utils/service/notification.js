import Notification from "../../models/Notification.js";

export const createNotification = async (walletId, agreementId, type, message) => {
    await Notification.create({ walletId, agreementId, type, message })
};

export const notificationWhenStatusChange = async (status, agreement, connectedWallet) => {
    const counterpartyWallet = connectedWallet === agreement.receiverWallet
        ? agreement.payerWallet
        : agreement.receiverWallet;
    const agreementId = agreement.agreementId

    switch (status) {
        case "Accepted":
            await Promise.all([
                createNotification(counterpartyWallet, agreementId, "Request Accepted", "Your agreement request has been accepted."),
                createNotification(agreement.payerWallet, agreementId,  "Deposit Funds", "Please deposit the agreed funds to proceed with the project. Kindly note that the deposit must be made within 72 hours from now to avoid any delays or potential cancellation of the project.")
            ]);
            break;

        case "Rejected":
            await createNotification(counterpartyWallet, agreementId, "Request Rejected", "Your agreement request has been rejected.");
            break;

        case "Negotiated":
            await createNotification(counterpartyWallet, agreementId, "Request Negotiated", "Your agreement request has been updated for negotiation.");
            break;

        case "AgreementUpdated":
            await createNotification(counterpartyWallet, agreementId, "Agreement Updated", "The agreement has been updated with new terms. Please review the changes and respond accordingly.");
            break;

        case "WorkSubmitted":
            await createNotification(agreement.payerWallet, agreementId, "Work Submitted", "The freelancer has submitted the work. Please release the payment to complete the process.");
            break;

        case "FundsReleased":
            await createNotification(agreement.receiverWallet, agreementId, "Fund Released", "The payment for your submitted work has been released. You may now withdraw the funds. Before you go, don’t forget to leave a rating for your payer!");

            await createNotification(agreement.payerWallet, agreementId, "Fund Released", "You’ve successfully released the payment. Before you go, don’t forget to leave a rating for your receiver!");
            break;
        
        case "Disputed":
            let formUrl = `https://yourdomain.com/evidence-form?agreementId=${agreementId}`

            await createNotification(counterpartyWallet, agreementId, "Dispute Raised", `The other party has raised a dispute. Please upload relevant evidence or documentation to support your side using the link ${formUrl}.`);
            break;
        
        case "AutoDisputed":
            let url = `https://yourdomain.com/evidence-form?agreementId=${agreementId}`
            
            await createNotification(agreement.payerWallet, agreementId, "Dispute Auto Raised", `A dispute has been automatically raised for ${agreement.projectTitle} project. You’re requested to submit your supporting evidence or documentation using the link. ${url}`);

            await createNotification(agreement.receiverWallet, agreementId, "Dispute Auto Raised", `A dispute has been automatically raised for ${agreement.projectTitle} project. You’re requested to submit your supporting evidence or documentation using the link. ${url}`);
            break;
    }
};


export const cronNotification = async (agreement) => {
    const msg = "Please deposit the agreed funds to proceed with the project. Kindly note that the deposit must be made within 72 hours from now to avoid any delays or potential cancellation of the project.";
    await createNotification(agreement.payerWallet, agreement.agreementId, "Deposit Funds", msg)
};

// ``