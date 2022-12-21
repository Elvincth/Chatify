import { IKeyDoc } from "interfaces";
import { Schema, Model, model, models } from "mongoose";

const KeySchema = new Schema<IKeyDoc>(
  {
    // privateKey: {
    //   type: String,
    // },
    publicKey: {
      type: String,
      required: true,
    },
    //Each user csn have only one key pair
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const KeyModel: Model<IKeyDoc> =
  models.Key || model<IKeyDoc>("Key", KeySchema);
