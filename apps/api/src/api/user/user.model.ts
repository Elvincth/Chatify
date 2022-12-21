import { Schema, model, models, Document, Model } from "mongoose";
import { IUser, IUserDoc } from "interfaces";
import { hashPassword } from "~/utils/password";

const UserSchema = new Schema<IUserDoc>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  { timestamps: true }
);

UserSchema.pre<IUserDoc>("save", function (next) {
  //If the password is not modified, we don't need to hash it again as it will waste computation power
  if (!this.isModified("password")) return next();

  hashPassword(this.password).then((passwordHash) => {
    this.password = passwordHash;
    next();
  });
});

const UserModel: Model<IUserDoc> =
  (models.User as Model<IUserDoc>) || model<IUserDoc>("User", UserSchema);

export default UserModel;
