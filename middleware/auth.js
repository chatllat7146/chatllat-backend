import jwt from "jsonwebtoken";
import SupportTeam from "../models/SupportTeam.js";
import asyncHandler from "../helper/async.js";
import ErrorResponse from "../helper/errorResponse.js";
import Admin from "../models/Admin.js";

//protect Routes
export const supportAuth = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(
            new ErrorResponse("Not authorize to access this route", 401)
        );
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE_IN,
        });
        const user = await SupportTeam.findOne({ _id: decoded.userId });
        if (!user)
            return next(
                new ErrorResponse("Not authorize to access this route", 401)
            );

        req.userId = decoded.userId;
        next();
    } catch (err) {
        if (err.message == "jwt expired")
            return next(new ErrorResponse("Token Expired, login again"));
        else {
            return next(
                new ErrorResponse("Not authorize to access this route", 401)
            );
        }
    }
});

export const adminAuth = asyncHandler(async (req, res, next) => {
    try {
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return next(
                new ErrorResponse("Not authorize to access this route", 401)
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE_IN,
        });

        const admin = await Admin.findOne({ _id: decoded.userId });
        if (!admin) {
            return next(
                new ErrorResponse("Not authorize to access this route", 401)
            );
        }

        req.userId = decoded.userId;
        next();
    } catch (error) {
        if (error.message == "jwt expired")
            return next(new ErrorResponse("Token Expired, login again"));
        else {
            return next(
                new ErrorResponse("Not authorize to access this route", 401)
            );
        }
    }
});
