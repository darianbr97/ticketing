import express from "express";
import "express-async-errors";
//middlewares
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError } from "@db97tickets/common";
// routers
import { newTicketRouter } from "./routes/new-ticket";
import { getSingleTicketRouter } from "./routes/get-single-ticket";
import { getTicketsRouter } from "./routes/get-tickets";
import { updateTicketRouter } from "./routes/update-ticket";

const app = express();
app.set("trust proxy", true);

app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(newTicketRouter);
app.use(getSingleTicketRouter);
app.use(getTicketsRouter);
app.use(updateTicketRouter);

app.all("*", () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export default app;
