import { checkEnvVar } from "@db97tickets/common";
import { natsService } from "./nats-service";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";

const start = async () => {
  try {
    const missingEnvVars = checkEnvVar(
      "REDIS_HOST",
      "NATS_CLUSTER_ID",
      "NATS_CLIENT_ID",
      "NATS_URL"
    );
    if (missingEnvVars) {
      throw new Error(missingEnvVars.join(", "));
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

    new OrderCreatedListener(natsService.client).listen();
  } catch (error) {
    console.error(error);
  }
};

start();
