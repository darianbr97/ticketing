import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";

const client = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

client.on("connect", async () => {
  console.log("Publisher connected to NATS");

  const publisher = new TicketCreatedPublisher(client);

  try {
    await publisher.publish({
      id: "1234",
      title: "shoes",
      price: 20.3,
    });
  } catch (error) {
    console.error(error);
  }
});
