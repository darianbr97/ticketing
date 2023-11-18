import { Subjects } from "./interfaces/subjects.interface";
import nats from "node-nats-streaming";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Publisher<T extends Event> {
  abstract subject: T["subject"];
  protected client: nats.Stan;

  constructor(client: nats.Stan) {
    this.client = client;
  }

  publish(data: T["data"]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) return reject(err);

        console.log(`Event - ${this.subject} - published`);
        resolve();
      });
    });
  }
}
