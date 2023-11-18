import mongoose, { Document, Model } from "mongoose";
import bcryptjs from "bcryptjs";

interface IUserAttrs {
  email: string;
  password: string;
}

interface IUserMethods {
  verifyPassword(inputPassword: string): Promise<boolean>;
}

interface IUserModel extends Model<IUserDoc, {}, IUserMethods> {
  build(attrs: IUserAttrs): IUserDoc;
}

export interface IUserDoc extends Document {
  email: string;
  password: string;
}

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
  next();
});

UserSchema.statics.build = (attrs) => new User(attrs);

UserSchema.methods = {
  verifyPassword: function (inputPassword: string) {
    return bcryptjs.compare(inputPassword, this.password);
  },
};

const User = mongoose.model<IUserDoc, IUserModel>("User", UserSchema);

export { User };
