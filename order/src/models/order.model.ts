import mongoose from "mongoose";
import { OrderStatus } from "@db97tickets/common";
import { ITicketDoc } from "./ticket.model";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface IOrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: ITicketDoc;
}

interface IOrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: ITicketDoc;
  version: number;
}

interface IOrderModel extends mongoose.Model<IOrderDoc> {
  build: (attrs: IOrderAttrs) => IOrderDoc;
}

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
      required: true,
    },
    ticket: {
      ref: "Ticket",
      type: mongoose.Schema.Types.ObjectId,
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

OrderSchema.set("versionKey", "version");
OrderSchema.plugin(updateIfCurrentPlugin);

OrderSchema.statics.build = (attrs: IOrderAttrs) => new Order(attrs);

const Order = mongoose.model<IOrderDoc, IOrderModel>("Order", OrderSchema);

export { Order, OrderStatus };
