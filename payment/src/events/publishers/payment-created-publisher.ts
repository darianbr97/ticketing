import { Publisher, PaymentCreatedEvent, Subjects } from "@db97tickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
