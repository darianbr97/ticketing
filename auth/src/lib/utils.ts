import jwt from "jsonwebtoken";
import { Request } from "express";

export const attachJwtCookie = ({
  req,
  payload,
}: {
  req: Request;
  payload: any;
}) => {
  const encodedJwt = jwt.sign(payload, process.env.JWT_KEY!);

  req.session = { jwt: encodedJwt };
};
