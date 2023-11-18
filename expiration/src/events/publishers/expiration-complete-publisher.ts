import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from "@db97tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
