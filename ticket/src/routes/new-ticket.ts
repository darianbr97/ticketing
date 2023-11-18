import { extractUserInfo, validateAuth } from "@db97tickets/common";
import { Request, Response, Router } from "express";
import { validateTicketInput } from "../middlewares/validate-ticket-input";
import { StatusCodes } from "http-status-codes";
import { Ticket } from "../models/ticket.model";
import { natsService } from "../nats-service";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";

const router = Router();

router
  .route("/api/tickets")
  .post(
    [extractUserInfo, validateAuth, validateTicketInput],
    async (req: Request, res: Response) => {
      const { title, price } = req.body;

      const newTicket = Ticket.build({
        title,
        price,
        userId: req.user!.id,
      });
      await newTicket.save();

      new TicketCreatedPublisher(natsService.client).publish({
        id: newTicket.id,
        title: newTicket.title,
        price: newTicket.price,
        userId: newTicket.userId,
        version: newTicket.version,
      });

      res.status(StatusCodes.CREATED).send(newTicket);
    }
  );

export { router as newTicketRouter };
