import { EthService } from "../../services/eth-service";
import { rpcProvider } from "../../providers/eth-provider";
import { TransactionEntity } from "../../db/entities/transaction";
import { TransactionResponseDto } from "../../db/dto/transaction-response-dto";
import { MockTransaction } from "../_mocks_/mock-transaction";
import PgConnect from "../../db/pg-connect";
import { queryMock } from "../_mocks_/pg-mock";

jest.mock("../../db/entities/transaction");

describe("EthService", () => {
  describe("getAllSavedTransactions", () => {
    it("should get all saved transactions", async () => {
      TransactionEntity.getAll = jest
        .fn()
        .mockImplementation(() => Promise.resolve([]));
      const service = new EthService(rpcProvider);
      const transactions = await service.getAllSavedTransactions();
      expect(transactions).toEqual([]);
    });
  });

  describe("getAllFetchedTransactionsPerPerson", () => {
    it("should get all personal looked up transactions", async () => {
      TransactionEntity.getAllPersonal = jest
        .fn()
        .mockImplementation(() => Promise.resolve([MockTransaction]));
      const service = new EthService(rpcProvider, {
        username: "alice",
        id: "1",
        password: "alice",
      });
      const transactions = await service.getAllFetchedTransactionsPerPerson();

      expect(transactions).toEqual([MockTransaction]);
    });

    it("should should reject if no decoded token is provided", async () => {
      TransactionEntity.getAllPersonal = jest
        .fn()
        .mockImplementation(() => Promise.reject());
      const service = new EthService(rpcProvider);

      try {
        await service.getAllFetchedTransactionsPerPerson();
        expect(true).toBeFalsy();
      } catch (error) {
        expect(true).toBeTruthy();
      }
    });
  });

  describe("getTransactionsByHash", () => {
    it("should get transactions by hash", async () => {
      jest
        .spyOn(PgConnect, "query")
        .mockImplementation(
          () =>
            new Promise(() =>
              Promise.resolve({ ...queryMock, rows: [MockTransaction] }),
            ),
        );
      // const rpcMock = jest
      //   .spyOn(rpcProvider, "getTransaction")
      //   .mockImplementation(
      //     (hash) =>
      //       new Promise(() =>
      //         Promise.resolve({ ...MockTransaction, transactionHash: hash }),
      //       ),
      //   );

      const service = new EthService(rpcProvider);

      const res = await service.getTransactionsByHash(
        "0xcbc920e7bb89cbcb540a469a16226bf1057825283ab8eac3f45d00811eef8a64",
      );

      console.log(res);
    });
  });
});
