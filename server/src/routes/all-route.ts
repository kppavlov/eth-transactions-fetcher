import { Router } from "express";
import { EthService } from "../services/eth-service";
import { rpcProvider } from "../providers/eth-provider";

const innerRoute = Router();

export default (outerRoute: Router) => {
  outerRoute.use("/all", innerRoute);

  innerRoute.get("/", async (_, res, next) => {
    try {
      const ethService = new EthService(rpcProvider);

      const transactions = await ethService.getAllSavedTransactions();

      res.status(200).send(transactions);
    } catch (e) {
      res.status(500).send(e);
    }
  });
};
