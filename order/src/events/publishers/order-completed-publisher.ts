import { OrderCompletedEvent, Publisher, Subjects } from "@db97tickets/common";

export class OrderCompletedPublisher extends Publisher<OrderCompletedEvent> {
  readonly subject = Subjects.OrderCompleted;
}
