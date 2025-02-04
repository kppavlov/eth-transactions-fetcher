import { NextFunction, Response } from "express";
import { TransactionRlpRequest } from "../types";
import { getRlpHexOrError } from "./utils";

export const ethRlpValidator = (
  req: TransactionRlpRequest,
  res: Response,
  next: NextFunction,
) => {
  const { rlPhex } = req.params;

  const check = getRlpHexOrError(rlPhex);

  if (
    typeof check !== "undefined" &&
    typeof check !== "string" &&
    !Array.isArray(check)
  ) {
    res.status(400).send(check.message);
    return;
  }

  req.decodedRlpHex = check;
  next();
};
