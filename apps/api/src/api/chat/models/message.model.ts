import { IMessageDoc } from "interfaces";
import { Schema, model, models, Model } from "mongoose";

const MessageSchema = new Schema<IMessageDoc>(
  {
    //Encrypt using the receiver's public key
    content: {
      type: String,
      required: true,
    },
    //Encrypt using the sender's private key as the sender need to be able to decrypt the message
    senderContent: {
      type: String,
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
  },
  { timestamps: true }
);

export const MessageModel: Model<IMessageDoc> =
  models.Message || model<IMessageDoc>("Message", MessageSchema);
