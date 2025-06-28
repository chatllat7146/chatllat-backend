import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
    {
        agreementId: {
            type: String,
            required: true
        },
        disputeId: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['DisputeRaised', 'InProcess', 'Resolved']
        },
        assignStatus: {
            type: String,
            enum: ['Pending', 'OnWork', 'Resolved', 'ReAssigned', 'Completed'],  // Resolved = resolved from support side, Completed = payent done from admin side, ReAssigned = reAssigned from admin side
            default: "Pending"
        },
        projectTitle: {
            type: String,
        },
        payerWalletAddress: {
            type: String
        },
        receiverWalletAddress: {
            type: String
        },
        disputeCategory: {
            type: String,
            required: true
            // "Work Not Delivered", "Payment Not Released", "Poor Quality of Work", "Missed Deadline", "Delayed Response or Inactivity", "Breach of Confidentiality"
        },
        evidence: {
            payerEvidence: {
                type: [String]
            },
            receiverEvidence: {
                type: [String]
            }
        },
        reasons: {
            payerReason: {
                type: String,
                default: null
            },
            receiverReason: {
                type: String,
                default: null
            },
            autoCreatedReason: {
                type: String,
                default: null
            },
        },
        disputeCreator: {
            type: String,
            enum: ['Payer', 'Receiver', 'Auto'],
            required: true
        },
        AssignedAgent: {
            agentId: {
                type: String,
                default: ""
            },
            fname: {
                type: String,
                default: ""
            },
            lname: {
                type: String,
                default: ""
            },
            email: {
                type: String,
                default: ""
            }
        },
        reAssignedReason: {
            type: String,
            default: null
        },
        supportDecision: {
            type: String,
            default: null
        },
        date: {
            responded: {
                type: Date,
                default: null
            },
            payerSubmittedProof: {
                type: Date,
                default: null
            },
            receiverSubmittedProof: {
                type: Date,
                default: null
            },
            DisputeEscalated: {
                type: Date,
                default: null
            },
            Resolved: {
                type: Date,
                default: null
            },
        }
    },
    { timestamps: true, versionKey: false }
);

const Dispute = mongoose.model("Dispute", disputeSchema);
export default Dispute

