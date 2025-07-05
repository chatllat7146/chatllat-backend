import ErrorResponse from "./errorResponse.js";
import give_response from "./help.js";

// const errorHandler = (err, req, res, next) => {
//     let error = { ...err };
//     error.message = err.message;

//     //Mongoose Bad Object
//     if (err.name === "CastError") {
//         const message = `Resourse not found`;
//         error = new ErrorResponse(message, 404);
//     }

//     //Mongoose Duplicate key
//     if (err.code === 11000) {
//         const message = "Duplicate field Value entered";
//         error = new ErrorResponse(message, 400);
//     }
//     // mongoose type error
//     if (err.name === "TypeError") {
//         const message = `bad request`;
//         error = new ErrorResponse(message, 400);
//     }

//     //Mongoose validation Error
//     if (err.name === "ValidationError") {
//         const message = Object.values(err.errors).map((val) => val.message);
//         error = new ErrorResponse(message, 400);
//     }

//     return give_response(res, error.statusCode || 500, false, error.message || "Server Error");

//     // res.status(error.statusCode || 500).json({
//     //   success: false,
//     //   error: error.message || "Server Error",
//     // });
// };


const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    //Mongoose Bad Object
    if (err.name === "CastError") {
        const message = `Resourse not found`;
        return give_response(res, 404, false, error.message || message);
        // error = new ErrorResponse(message, 404);
    }

    //Mongoose Duplicate key
    if (err.code === 11000) {
        const message = "Duplicate field Value entered";
        return give_response(res, 400, false, error.message || message);
        // error = new ErrorResponse(message, 400);
    }
    // mongoose type error
    if (err.name === "TypeError") {
        const message = `bad request`;
        return give_response(res, 400, false, error.message || message);
        // error = new ErrorResponse(message, 400);
    }

    //Mongoose validation Error
    if (err.name === "ValidationError") {
        const message = 'bad request';
        return give_response(res, 400, false, error.message || message);
        // error = new ErrorResponse(message, 400);
    }

    return give_response(res, error.statusCode || 500, false, error.message || "Server Error");

};

export default errorHandler;
