import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
    {
        profileImage: {
            type: String,
            default:
                "https://res.cloudinary.com/doojdskc0/image/upload/v1748344691/e5js3xkuomoztoysrtaf.png",
        },
        name: {
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
    },
    { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
