import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  extractUserInfo,
  validateAuth,
  validateIdParam,
} from "@db97tickets/common";
import { Request, Response, Router } from "express";
import { Ticket } from "../models/ticket.model";
import { StatusCodes } from "http-status-codes";
import { validateTicketInput } from "../middlewares/validate-ticket-input";
import { natsService } from "../nats-service";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";

const router = Router();

router
  .route("/api/tickets/:id")
  .put(
    [extractUserInfo, validateAuth, validateIdParam, validateTicketInput],
    async (req: Request, res: Response) => {
      const { title, price } = req.body;
      const { id: ticketId } = req.params;

      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        throw new NotFoundError("Ticket not found");
      }

      const userOwnTicket = ticket.userId.toString() === req.user!.id;
      if (!userOwnTicket) {
        throw new UnauthorizedError();
      }

      const isTicketReserved = !!ticket?.orderId;
      if (isTicketReserved) {
        throw new BadRequestError("Cannot edit a reserved ticket");
      }

      ticket.set({ title, price });
      await ticket.save();

      new TicketUpdatedPublisher(natsService.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version,
        orderId: ticket?.orderId,
      });

      res.status(StatusCodes.OK).send(ticket);
    }
  );

export { router as updateTicketRouter };
