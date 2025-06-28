import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    walletId: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: "https://res.cloudinary.com/doojdskc0/image/upload/v1748344691/e5js3xkuomoztoysrtaf.png"
    },
    name: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    },
    contact: {
        type: String,
        default: ""
    },
    ratings: {
        type: [Number],
        default: []
    },
    description: {
        type: String,
        default: ""
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;