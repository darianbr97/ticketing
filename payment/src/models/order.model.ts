import { OrderStatus } from "@db97tickets/common";
import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface IOrderAttrs {
  id: string;
  status: OrderStatus;
  userId: string;
  price: number;
}

interface IOrderDoc extends mongoose.Document {
  status: OrderStatus;
  userId: string;
  price: number;
  version: number;
}

interface IOrderModel extends mongoose.Model<IOrderDoc> {
  build: (attrs: IOrderAttrs) => IOrderDoc;
}

const OrderSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
    },
    userId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
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

OrderSchema.set("versionKey", "version");
OrderSchema.plugin(updateIfCurrentPlugin);

OrderSchema.statics.build = (attrs: IOrderAttrs) => {
  const order: Partial<IOrderAttrs> = { ...attrs };
  delete order.id;

  return new Order({
    _id: attrs.id,
    ...order,
  });
};

const Order = mongoose.model<IOrderDoc, IOrderModel>("Order", OrderSchema);

export { Order };
