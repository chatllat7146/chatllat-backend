import jwt from "jsonwebtoken";

// Function to generate a token for a user
export const generateToken = ({ userId, email }) => {
    const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_IN,
    });
    return token;
};
