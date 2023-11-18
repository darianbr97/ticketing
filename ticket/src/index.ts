import mongoose from "mongoose";
import app from "./app";
import { checkEnvVar } from "@db97tickets/common";
import { natsService } from "./nats-service";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";

const start = async () => {
  const missingEnvVars = checkEnvVar(
    "TICKET_MONGO_URI",
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

    await mongoose.connect(process.env.TICKET_MONGO_URI!);
    console.log("db connected...");

    new OrderCreatedListener(natsService.client).listen();
    new OrderCancelledListener(natsService.client).listen();
  } catch (error) {
    console.log(error);
  }

  app.listen(4001, () => {
    console.log("Listening on PORT 4001...");
  });
};

start();
