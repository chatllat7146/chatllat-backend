import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
	{
		sender: {
			type: String,
		},
		receiver: {
			type: String,
		},
		msg: {
			type: String,
			default: ""
		},
		read: {
			type: Boolean,
			default: false,
		},
		// type: {
		// 	type: String,
		// 	default: "msg", //msg, image, document
		// },
		image: {
            type: String,
			default: ""
        },
		document: {
			type: String,
			default: ""
		},
		isGroup: {
			type: Boolean,
            default: false, //false- personal_chat, true- group_chat
		},
		groupId: {
			type: String,
			default: null
		},
		groupName: {
			type: String
		},
		groupMember: {
			type: [String],
			default: []
		},
		groupMsgReadBy: {
			type: [String],
			default: []
		}
	},
	{ timestamps: true, versionKey: false }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat
