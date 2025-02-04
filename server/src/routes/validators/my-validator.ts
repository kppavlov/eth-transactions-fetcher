import { header, validationResult } from "express-validator";
import { NextFunction, Response, Request } from "express";

export const authenticateCredentialsValidator = () =>
  header("auth_token").notEmpty().isJWT();

export const authenticateCredentialsValidatorHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const validRes = validationResult(req);

  if (!validRes.isEmpty()) {
    res.status(400).send(validRes.array());
  }

  next();
};
