import { NotFoundError, validateIdParam } from "@db97tickets/common";
import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { Ticket } from "../models/ticket.model";

const router = Router();

router
  .route("/api/tickets/:id")
  .get([validateIdParam], async (req: Request, res: Response) => {
    const { id: ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    res.status(StatusCodes.OK).send(ticket);
  });

export { router as getSingleTicketRouter };
