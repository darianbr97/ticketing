import { Listener } from "./base-listener";
import nats from "node-nats-streaming";
import { TicketCreatedEvent } from "./ticket-created-event.interface";
import { Subjects } from "./subjects";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = "payments-service";

  onMessage(data: TicketCreatedEvent["data"], msg: nats.Message): void {
    console.log(data);

    msg.ack();
  }
}
