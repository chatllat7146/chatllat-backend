import asyncHandler from "../helper/async.js";
import give_response from "../helper/help.js";
import { uploadToCloudinary } from "../utils/service/uploadService.js";

export const uploadFile = asyncHandler(async (req, res, next) => {
    try {
        const files = req.files;
        
        const uploadPromises = files.map((file) =>
            uploadToCloudinary(file.buffer, file.originalname)
        );

        const results = await Promise.all(uploadPromises);
        const imgUrls = []
        results.map((result) => {
            imgUrls.push(result.secure_url)
        })

        return give_response(res, 200, true, "File uploaded successfully", { imgUrls });
    } catch (error) {
        next(error);
    }
});
