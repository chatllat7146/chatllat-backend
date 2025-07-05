import mongoose from "mongoose";

const supportTeamSchema = new mongoose.Schema(
    {
        profileImage: {
            type: String,
            default:
                "https://res.cloudinary.com/doojdskc0/image/upload/v1748344691/e5js3xkuomoztoysrtaf.png",
        },
        fname: {
            type: String,
            default: "",
        },
        lname: {
            type: String,
            default: "",
        },
        email: {
            type: String,
            unique: true,
        },
        password: {
            type: String,
            select: false
        },
        contact: {
            type: String,
            default: "",
        },
        isOnline: { 
            type: Boolean, 
            default: 0     // 0 = offline, 1 = online
        },
        // signupOtp: {
        //     type: Number,
        //     trim: true,
        //     select: false,
        // },
        // signupOtp_timestamp: {
        //     type: Date,
        // },
        forgotOtp: {
            type: Number,
            trim: true,
            select: false,
        },
        forgotOtp_timestamp: {
            type: Date,
            default: null
        },
        isVerify: {
            type: Boolean,
            default: false
        },
        isVerifyForgotOtp: {
            type: Boolean,
            default: false
        },
        assignedDispute: {
            type: [String],
            default: []
        }
    },
    { timestamps: true }
);

const Support = mongoose.model("SupportTeam", supportTeamSchema);

export default Support;
