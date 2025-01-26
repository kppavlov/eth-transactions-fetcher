import e, { NextFunction, Response } from "express";
import { TransactionRlpRequest } from "../types";
import { ethers } from "ethers";

export const ethRlpValidator = (
  req: TransactionRlpRequest,
  res: Response,
  next: NextFunction,
) => {
  const { rlPhex } = req.params;

  const isHex = ethers.isHexString(rlPhex);

  if (!isHex) {
    res
      .status(400)
      .send({ error: "The provided value for rlp is not a hex string." });
    return;
  }

  const decoded = ethers.decodeRlp(rlPhex);

  if (Array.isArray(decoded)) {
    const areAllValuesWithCorrectForm = decoded.every((transactionHash) =>
      ethers.isHexString(transactionHash, 32),
    );

    if (!areAllValuesWithCorrectForm) {
      res
        .status(400)
        .send({
          error: "Not all provided values are correct transaction hashes",
        });
      return;
    }

    req.decodedRlpHex = decoded;
    next();
    return;
  }

  if (!ethers.isHexString(decoded, 32)) {
    res.status(400).send({ error: "Invalid value for hex string." });
    return;
  }

  req.decodedRlpHex = decoded;
  next();
};
