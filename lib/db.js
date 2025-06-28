import mongoose from "mongoose";

// Function to connect to the mongodb database
// export const connectDB = async () =>{
//     try {

//         mongoose.connection.on('connected', ()=> console.log('Database Connected'));

//         await mongoose.connect(`${process.env.MONGODB_URI}/chat-app?retryWrites=true&w=majority`)
//     } catch (error) {
//         console.log(error);
//     }
// }


export const connectDB = async () => {
    await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`)
    .then(() => {
        console.log("database connected");
    })
    .catch((err) => {
        console.log(err);
    })
};

