import { app } from "./app";
import { checkEnvVar } from "@db97tickets/common";
import { natsService } from "./nats-service";
import mongoose from "mongoose";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";
import { OrderCompletedListener } from "./events/listeners/order-completed-listener";

const start = async () => {
  try {
    const missingEnvVar = checkEnvVar(
      "JWT_KEY",
      "STRIPE_KEY",
      "NATS_CLUSTER_ID",
      "NATS_CLIENT_ID",
      "NATS_URL",
      "PAYMENT_MONGO_URI"
    );
    if (missingEnvVar) {
      throw new Error(missingEnvVar.join(", "));
    }

    await natsService.connect(
      process.env.NATS_CLUSTER_ID!,
      process.env.NATS_CLIENT_ID!,
      process.env.NATS_URL!
    );
    natsService.client.on("close", () => {
      console.log("NATS disconnected...");
      process.exit();
    });
    process.on("SIGINT", () => natsService.client.close());
    process.on("SIGTERM", () => natsService.client.close());

    await mongoose.connect(process.env.PAYMENT_MONGO_URI!);
    console.log("db connected...");

    new OrderCreatedListener(natsService.client).listen();
    new OrderCancelledListener(natsService.client).listen();
    new OrderCompletedListener(natsService.client).listen();
  } catch (error) {
    console.log(error);
  }

  app.listen(4003, () => {
    console.log("Listening on port 4003...");
  });
};

start();
