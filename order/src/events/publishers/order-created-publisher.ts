import { OrderCreatedEvent, Publisher, Subjects } from "@db97tickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
