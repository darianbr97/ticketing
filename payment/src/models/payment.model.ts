import mongoose from "mongoose";

interface IPaymentAttrs {
  orderId: string;
  stripeId: string;
}

interface IPaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
}

interface IPaymentModel extends mongoose.Model<IPaymentDoc> {
  build: (attrs: IPaymentAttrs) => IPaymentDoc;
}

const PaymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

PaymentSchema.statics.build = (attrs: IPaymentAttrs) => new Payment(attrs);

export const Payment = mongoose.model<IPaymentDoc, IPaymentModel>(
  "Payment",
  PaymentSchema
);
