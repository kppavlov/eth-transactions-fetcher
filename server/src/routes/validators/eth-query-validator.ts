import { query, validationResult } from "express-validator";
import { ethers } from "ethers";

// TYPES
import { Hash, Hashes } from "../../db/types";
import { Response, NextFunction } from "express";
import { TransactionHashesRequest } from "../types";

export const transactionHashesValidator = () =>
  query("transactionHashes")
    .notEmpty()
    .escape()
    .custom((value: Hash | Hashes) => {
      if (Array.isArray(value)) {
        return value.every((val) => ethers.isHexString(val, 32));
      }

      return ethers.isHexString(value, 32);
    });

export const transactionHashesValidatorHandler = (
  req: TransactionHashesRequest,
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
