import mongoose from "mongoose";
import app from "./app";
import { checkEnvVar } from "@db97tickets/common";
import { natsService } from "./nats-service";
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener";
import { ExpirationCompleteListener } from "./events/listeners/expiration-complete-listener";
import { PaymentCreatedListener } from "./events/listeners/payment-created-listener";

const start = async () => {
  const missingEnvVars = checkEnvVar(
    "ORDER_MONGO_URI",
    "NATS_URL",
    "NATS_CLUSTER_ID",
    "NATS_CLIENT_ID"
  );
  if (missingEnvVars) throw new Error(missingEnvVars.join(", "));

  try {
    await natsService.connect(
      process.env.NATS_CLUSTER_ID!,
      process.env.NATS_CLIENT_ID!,
      process.env.NATS_URL!
    );
    natsService.client.on("close", () => {
      console.log("NATS connection closed!");
      process.exit();
    });
    process.on("SIGINT", () => natsService.client.close());
    process.on("SIGTERM", () => natsService.client.close());

    await mongoose.connect(process.env.ORDER_MONGO_URI!);
    console.log("db connected...");

    new TicketCreatedListener(natsService.client).listen();
    new TicketUpdatedListener(natsService.client).listen();
    new ExpirationCompleteListener(natsService.client).listen();
    new PaymentCreatedListener(natsService.client).listen();
  } catch (error) {
    console.error(error);
  }

  app.listen(4002, () => {
    console.log("Listening on port 4002...");
  });
};

start();
