import { body, validationResult } from "express-validator";
import { TransactionHashesRequest } from "../types";
import { NextFunction, Response, Request } from "express";

export const authenticateCredentialsValidator = () =>
  body(["username", "password"]).notEmpty();

export const authenticateCredentialsValidatorHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const validRes = validationResult(req);

  if (!validRes.isEmpty()) {
    res.status(400).send(validRes.array());
    return;
  }

  next();
};
