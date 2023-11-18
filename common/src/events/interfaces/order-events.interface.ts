import { Subjects } from "./subjects.interface";

export enum OrderStatus {
  // When the order has been created, but the ticket it
  // is trying to order has not been reserved
  Created = "created",

  // The ticket the order is trying to reserve has already been reserved,
  // or when the user has cancelled the order,
  // or the order expires before payment
  Cancelled = "cancelled",

  // The order has successfully reserved the ticket
  AwaitingPayment = "awaiting:payment",

  // The order has reserved the ticket and the user has provided
  // payment successfully
  Complete = "complete",
}

export interface OrderCreatedEvent {
  subject: Subjects.OrderCreated;
  data: {
    id: string;
    userId: string;
    status: OrderStatus;
    expiresAt: string;
    ticket: {
      id: string;
      price: number;
    };
    version: number;
  };
}

export interface OrderCancelledEvent {
  subject: Subjects.OrderCancelled;
  data: {
    id: string;
    version: number;
    ticket: {
      id: string;
    };
  };
}

export interface OrderCompletedEvent {
  subject: Subjects.OrderCompleted;
  data: {
    id: string;
    version: number;
  };
}
