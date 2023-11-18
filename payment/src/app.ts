import express from "express";
import "express-async-errors";

import cookieSession from "cookie-session";
import { errorHandler, NotFoundError } from "@db97tickets/common";
import { CreatePaymentRouter } from "./routes/create-payment";

const app = express();
app.set("trust proxy", true);

app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(CreatePaymentRouter);

app.all("*", () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
