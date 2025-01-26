import { Router } from "express";
import { EthService } from "../services/eth-service";
import { rpcProvider } from "../providers/eth-provider";
import {
  authenticateCredentialsValidator,
  authenticateCredentialsValidatorHandler,
} from "./validators/my-validator";
import { MyRequest } from "./types";
import jwt from "jsonwebtoken";
import { IUser } from "../db/entities/user";
import envConfig from "../config";

const innerRoute = Router();

export default (outerRoute: Router) => {
  outerRoute.use("/my", innerRoute);

  innerRoute.get(
    "/",
    authenticateCredentialsValidator(),
    authenticateCredentialsValidatorHandler,
    async (req: MyRequest, res) => {
      try {
        const { auth_token } = req.headers;
        console.log(jwt.decode(auth_token ?? ""));
        const decodedToken = jwt.verify(
          auth_token ?? "",
          envConfig.jwtSecret,
        ) as IUser;

        const ethService = new EthService(rpcProvider, decodedToken);

        const transactions =
          await ethService.getAllFetchedTransactionsPerPerson();

        res.status(200).send(transactions);
      } catch (e) {
        console.log(e);
        res.status(500).send(e);
      }
    },
  );
};
