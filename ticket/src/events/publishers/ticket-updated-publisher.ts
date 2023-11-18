import { Publisher, Subjects, TicketUpdatedEvent } from "@db97tickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
