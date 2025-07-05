import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import agreementRouter from "./routes/agreementRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import uploadRouter from "./routes/uploadRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import disputeRouter from "./routes/disputeRoutes.js";
import webhookRouter from "./routes/webhookRoutes.js";
import SupportTeamRouter from "./routes/supportTeamRoutes.js";
import recordWithdrawalRouter from "./routes/withdrawalRoutes.js";
import swapRouter from "./routes/swapRoutes.js";
import adminRouter from "./routes/AdminRoutes.js";
import postRouter from "./routes/postRoutes.js";

import { Server } from "socket.io";
import Agreement from "./models/Agreement.js";
import SupportTeam from "./models/SupportTeam.js";
import Chat from "./models/Chat.js";
import errorHandler from "./helper/error.js";
import bodyParser from "body-parser";
import sendFundDepositNotification from "./utils/service/cron.js";
import GroupChat from "./models/GroupChat.js";
sendFundDepositNotification();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
await connectDB();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(bodyParser.json());

// Create Express app and HTTP server
const server = http.createServer(app);

// Routes setup
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/user", userRouter);
app.use("/api/agreement", agreementRouter);
app.use("/api/chat", chatRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/dispute", disputeRouter);
app.use("/api/supportTeam", SupportTeamRouter);
app.use("/api/withdraw", recordWithdrawalRouter);
app.use("/api/swap", swapRouter);
app.use("/api/admin", adminRouter);
app.use("/api/post", postRouter);
app.use(
    "/api/webhook",
    express.raw({ type: "application/json" }),
    webhookRouter
);

app.use(errorHandler);

// Initialize socket.io server
// export const io = new Server(server, {
//     cors: { origin: "*" },
// });
// global.io = io;
// global.users = {};

// io.on("connection", async (socket) => {
//     console.log("User connected");

//     // Handle user connection
//     socket.on("connect_user", async (data) => {
//         console.log(data, "connect_user");
//         console.log(socket.id, "socket.id");
//         global.users[data.userid] = socket.id;

//         const agreementData = await Agreement.findOne({
//             $or: [
//                 { payerWallet: data.userid },
//                 { receiverWallet: data.userid },
//             ],
//         });

//         if (!agreementData) {
//             await SupportTeam.updateOne({ _id: data.userid }, { isOnline: 1 });
//         } else {
//             if (data.userid === agreementData?.payerWallet) {
//                 await Agreement.updateOne(
//                     { payerWallet: data.userid },
//                     { "payerDetails.isOnline": 1 }
//                 );
//             } else {
//                 await Agreement.updateOne(
//                     { receiverWallet: data.userid },
//                     { "receiverDetails.isOnline": 1 }
//                 );
//             }
//         }

//         io.to(socket.id).emit("connect_user", "User connected.");
//     });

//     // Handle sending a private message (user-to-user)
//     socket.on("sendMessage", async (data) => {
//         try {
//             const sender = data.sender;
//             const receiver = data.receiver;

//             if (!sender || !receiver) {
//                 return io
//                     .to(socket.id)
//                     .emit(
//                         "sendMessageError",
//                         "Sender and receiver are required."
//                     );
//             }

//             socket.to(global.users[receiver]).emit("receiveMessage", data);

//             const messagebody = {
//                 sender: data.sender,
//                 receiver: data.receiver,
//                 msg: data.msg || "",
//                 image: data.image || "",
//                 document: data.document || "",
//             };

//             await Chat.create(messagebody); // Save message to DB
//         } catch (error) {
//             console.error("Error sending message:", error);
//             io.to(socket.id).emit(
//                 "sendMessageError",
//                 "Failed to send message."
//             );
//         }
//     });

//     // Handle sending a group message (group chat)
//     socket.on("sendGroupMessage", async (data) => {
//         try {
//             const { groupId, sender, msg, image, document } = data;

//             console.log(data, "sendGroupMessage===");

//             if (!groupId || !sender) {
//                 return io
//                     .to(socket.id)
//                     .emit(
//                         "sendGroupMessageError",
//                         "Group ID and sender are required."
//                     );
//             }

//             // Emit the message to all users in the group (using the groupId as the room)
//             socket.to(groupId).emit("receiveGroupMessage", data);

//             const groupChat = await GroupChat.findOne({ groupId });
//             console.log(groupChat, "groupchat===");

//             const messagebody = {
//                 groupId,
//                 sender: sender,
//                 msg: msg || "",
//                 image: image || "",
//                 document: document || "",
//                 isGroup: true,
//                 groupName: groupChat.groupName,
//                 groupMember: groupChat.groupMember,
//             };

//             // Save the group message to the database
//             await Chat.create(messagebody);
//         } catch (error) {
//             console.error("Error sending group message:", error);
//             io.to(socket.id).emit(
//                 "sendGroupMessageError",
//                 "Failed to send group message."
//             );
//         }
//     });

//     // Handle joining a group
//     socket.on("joinGroup", async (groupId) => {
//         // Join the specified group chat room
//         console.log(groupId.groupId, "groupId===========");

//         socket.join(groupId.groupId);

//         // Emit an event to notify others that a user has joined the group
//         io.to(groupId.groupId).emit(
//             "newUserJoined",
//             `User ${socket.id} joined the group.`
//         );
//     });

//     // Handle disconnect
//     socket.on("disconnect", async () => {
//         console.log(socket.id, " Disconnected");
//         const disconnectedUserId = Object.keys(global.users).find(
//             (key) => global.users[key] === socket.id
//         );

//         const agreementData = await Agreement.findOne({
//             $or: [
//                 { payerWallet: disconnectedUserId },
//                 { receiverWallet: disconnectedUserId },
//             ],
//         });

//         if (!agreementData) {
//             await SupportTeam.updateOne(
//                 { _id: disconnectedUserId },
//                 { isOnline: 0 }
//             );
//         } else {
//             if (disconnectedUserId === agreementData?.payerWallet) {
//                 await Agreement.updateOne(
//                     { payerWallet: disconnectedUserId },
//                     { "payerDetails.isOnline": 0 }
//                 );
//             } else {
//                 await Agreement.updateOne(
//                     { receiverWallet: disconnectedUserId },
//                     { "receiverDetails.isOnline": 0 }
//                 );
//             }
//         }

//         // Remove the user from the global `users` object
//         delete global.users[disconnectedUserId];
//     });
// });


app.get('/', (req, res) => {
    res.send(`backend deployed on port..${PORT}`)
});

server.listen(PORT, () => console.log("Server is running on PORT: " + PORT));
