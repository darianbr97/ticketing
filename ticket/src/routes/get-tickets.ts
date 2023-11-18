import { Request, Response, Router } from "express";
import { Ticket } from "../models/ticket.model";
import { StatusCodes } from "http-status-codes";

const router = Router();

router.route("/api/tickets").get(async (req: Request, res: Response) => {
  const tickets = await Ticket.find({ orderId: undefined });

  res.status(StatusCodes.OK).send({ tickets, total: tickets.length });
});

export { router as getTicketsRouter };
