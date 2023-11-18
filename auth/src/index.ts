import mongoose from "mongoose";
import app from "./app";
import { checkEnvVar } from "@db97tickets/common";

const start = async () => {
  const missingEnvVars = checkEnvVar("JWT_KEY", "AUTH_MONGO_URI");
  if (missingEnvVars) throw new Error(missingEnvVars.join(", "));

  try {
    await mongoose.connect(process.env.AUTH_MONGO_URI!);
    console.log("db connected...");
  } catch (error) {
    console.log(error);
  }

  app.listen(4000, () => {
    console.log("Listening on PORT 4000...");
  });
};

start();
