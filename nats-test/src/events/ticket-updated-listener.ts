import { Listener } from "./base-listener";
import nats from "node-nats-streaming";
import { Subjects } from "./subjects";

interface TicketUpdatedEvent {
  subject: Subjects.TicketUpdated;
  data: {
    id: string;
    title: string;
    price: number;
    userId: string;
  };
}

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = "payments-service";

  onMessage(data: TicketUpdatedEvent["data"], msg: nats.Message): void {
    console.log(data);

    msg.ack();
  }
}
