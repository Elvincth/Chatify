import { IConversationDoc } from "interfaces";
import { isArray } from "lodash";
import { Schema, model, models, Model } from "mongoose";

const ConversationSchema = new Schema<IConversationDoc>(
  {
    participants: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],
      required: true,
      validate: (v: []) => isArray(v) && v.length > 1,
    },
  },
  { timestamps: true }
);

export const ConversationModel: Model<IConversationDoc> =
  (models.Conversation as Model<IConversationDoc>) ||
  model<IConversationDoc>("Conversation", ConversationSchema);
