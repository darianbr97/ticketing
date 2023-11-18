import { Publisher, OrderCancelledEvent, Subjects } from "@db97tickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
