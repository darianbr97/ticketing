import express from "express";
import "express-async-errors";
//middlewares
import cookieSession from "cookie-session";
import { NotFoundError, errorHandler } from "@db97tickets/common";

//routers
import { GetOrdersRouter } from "./routes/get-orders";
import { GetSingleOrderRouter } from "./routes/get-single-order";
import { CreateOrderRouter } from "./routes/new-order";
import { DeleteOrderRouter } from "./routes/delete-order";

const app = express();
app.set("trust proxy", true);

app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(CreateOrderRouter);
app.use(GetOrdersRouter);
app.use(GetSingleOrderRouter);
app.use(DeleteOrderRouter);

app.all("*", () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export default app;
