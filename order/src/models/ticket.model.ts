import mongoose from "mongoose";
import { Order, OrderStatus } from "./order.model";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface ITicketAttrs {
  id: string;
  title: string;
  price: number;
}

export interface ITicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved: () => Promise<boolean>;
}

interface ITickerModel extends mongoose.Model<ITicketDoc> {
  build: (attrs: ITicketAttrs) => ITicketDoc;
  findByIdAndPreviousVersion: (query: {
    id: string;
    version: number;
  }) => Promise<ITicketDoc | null>;
}

const TicketSchema = new mongoose.Schema(
  {
    title: {
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

TicketSchema.set("versionKey", "version");
TicketSchema.plugin(updateIfCurrentPlugin);

TicketSchema.statics = {
  build: (attrs: ITicketAttrs) => {
    const ticket: Partial<ITicketAttrs> = { ...attrs };
    delete ticket.id;

    return new Ticket({
      _id: attrs.id,
      ...ticket,
    });
  },
  findByIdAndPreviousVersion: (query: { id: string; version: number }) => {
    return Ticket.findOne({
      _id: query.id,
      version: query.version - 1,
    });
  },
};

TicketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

const Ticket = mongoose.model<ITicketDoc, ITickerModel>("Ticket", TicketSchema);

export { Ticket };
