import { Router } from "express";
import jwt from "jsonwebtoken";

// VALIDATORS
import {
  transactionHashesValidator,
  transactionHashesValidatorHandler,
} from "./validators/eth-query-validator";
import { ethRlpValidator } from "./validators/eth-param-validator";

// CONSTANTS
import { rpcProvider } from "../providers/eth-provider";
import envConfig from "../config";

// TYPES
import { EthService } from "../services/eth-service";
import { TransactionHashesRequest, TransactionRlpRequest } from "./types";
import { IUser } from "../db/entities/user";
import { UserService } from "../services/user-service";

const innerRoute = Router();

export default (outerRoute: Router) => {
  outerRoute.use("/eth", innerRoute);

  innerRoute.get(
    "/",
    transactionHashesValidator(),
    transactionHashesValidatorHandler,
    async (req: TransactionHashesRequest, res) => {
      const query = req.query;
      const { auth_token } = req.headers;

      try {
        let decodedToken;

        if (auth_token) {
          const userService = new UserService();

          decodedToken = userService.verifyJwtToken(auth_token);
        }

        if (decodedToken) {
          const usersService = new UserService();

          const user = await usersService.getUserIfExists(
            decodedToken.username,
          );

          if (!user) {
            res.status(401).send(new Error("Token`s payload is incorrect!"));
            return;
          }
        }

        const ethService = new EthService(rpcProvider, decodedToken);

        const transactions =
          (await ethService.getTransactionsByHash(query.transactionHashes)) ??
          [];

        if (!transactions.length) {
          res
            .status(422)
            .send(new Error("None of the transactions could be fetched"));
          return;
        }
        res.status(200).send(transactions);
        return;
      } catch (e) {
        res.status(500).send({ error: e });
        return;
      }
    },
  );

  innerRoute.get(
    "/:rlPhex",
    ethRlpValidator,
    async (req: TransactionRlpRequest, res) => {
      const { decodedRlpHex = "" } = req;
      const { auth_token } = req.headers;

      let decodedToken;

      if (auth_token) {
        const userService = new UserService();

        decodedToken = userService.verifyJwtToken(auth_token);
      }

      const ethService = new EthService(rpcProvider, decodedToken);

      try {
        const transactions =
          (await ethService.getTransactionsByHash(decodedRlpHex as string)) ??
          [];

        if (!transactions.length) {
          res
            .status(422)
            .send(new Error("None of the transactions could be fetched"));
          return;
        }
        res.status(200).send(transactions);
        return;
      } catch (e) {
        res.status(500).send({ error: e });
        return;
      }
    },
  );
};
