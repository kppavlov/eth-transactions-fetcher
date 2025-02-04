import { TransactionResponse } from "ethers";
import { EthService } from "../../services/eth-service";
import { rpcProvider } from "../../providers/eth-provider";
import { TransactionEntity } from "../../db/entities/transaction";
import {
  MockTransaction,
  mockTransactionReceipt,
  mockTransactionResponse,
} from "../_mocks_/mock-transaction";
import PgConnect from "../../db/pg-connect";

describe("EthService", () => {
  beforeAll(() => {
    jest
      .spyOn(PgConnect, "query")
      .mockImplementation(() => Promise.resolve([MockTransaction]));
  });

  describe("getAllSavedTransactions", () => {
    it("should get all saved transactions", async () => {
      const service = new EthService(rpcProvider);
      const transactions = await service.getAllSavedTransactions();
      expect(transactions).toEqual([MockTransaction]);
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

    it("should reject if no decoded token is provided", async () => {
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
    beforeAll(() => {
      jest
        .spyOn(rpcProvider, "getTransaction")
        .mockImplementation(() => Promise.resolve(mockTransactionResponse));
      jest
        .spyOn(rpcProvider, "getTransactionReceipt")
        .mockImplementation(() => Promise.resolve(mockTransactionReceipt));
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should get single transaction when provided a single hash", async () => {
      const service = new EthService(rpcProvider);

      const singleTransactionHashSpy = jest.spyOn(
        EthService.prototype,
        "handleSingleTransactionHash",
      );
      const singleTransactionFetchHashSpy = jest.spyOn(
        EthService.prototype,
        "fetchAndSaveSingleTransaction",
      );

      const transactionHash =
        "0xcbc920e7bb89cbcb540a469a16226bf1057825283ab8eac3f45d00811eef8a64";
      const res = await service.getTransactionsByHash(transactionHash);

      expect(singleTransactionHashSpy).toHaveBeenCalledWith(transactionHash);
      expect(singleTransactionFetchHashSpy).toHaveBeenCalledWith(
        transactionHash,
      );
      expect(TransactionEntity.memoizedTransactions).toEqual(
        new Map().set(transactionHash, { ...MockTransaction, hasBeenSaved: false }),
      );
      expect(res).toEqual([MockTransaction]);
    });

    it("should get multiple transactions when provided more than one hash", async () => {
      const firstHash =
        "0xcbc920e7bb89cbcb540a469a16226bf1057825283ab8eac3f45d00811eef8a64";
      const secondHash =
        "0xcbc920e7bb89cbcb540a469a16226bf1057825283ab8eac3f45d00811eef8a65";
      const service = new EthService(rpcProvider);
      jest.clearAllMocks();
      jest
        .spyOn(PgConnect, "query")
        .mockClear()
        .mockReturnValue(
          new Promise((resolve) =>
            resolve([{ ...MockTransaction, transactionHash: firstHash }]),
          ),
        )
        .mockReturnValue(
          new Promise((resolve) =>
            resolve([{ ...MockTransaction, transactionHash: secondHash }]),
          ),
        );
      jest
        .spyOn(rpcProvider, "getTransaction")
        .mockImplementationOnce((hash) =>
          Promise.resolve({
            ...mockTransactionResponse,
            hash,
          } as TransactionResponse),
        )
        .mockImplementationOnce((hash) =>
          Promise.resolve({
            ...mockTransactionResponse,
            hash,
          } as TransactionResponse),
        );
      jest
        .spyOn(rpcProvider, "getTransactionReceipt")
        .mockImplementation(() => Promise.resolve(mockTransactionReceipt));

      const singleTransactionHashSpy = jest.spyOn(
        EthService.prototype,
        "handleMultipleTransactionHashes",
      );
      const multipleTransactionFetchHashSpy = jest.spyOn(
        EthService.prototype,
        "fetchAndSaveTransactions",
      );
      const singleTransactionFetchHashSpy = jest.spyOn(
        EthService.prototype,
        "fetchAndSaveSingleTransaction",
      );

      const transactionHashes = [firstHash, secondHash];
      const res = await service.getTransactionsByHash(transactionHashes);

      expect(singleTransactionHashSpy).toHaveBeenCalledWith(transactionHashes);
      expect(multipleTransactionFetchHashSpy).toHaveBeenCalledWith(
        transactionHashes,
      );
      expect(singleTransactionFetchHashSpy).toHaveBeenCalledWith(firstHash);
      expect(singleTransactionFetchHashSpy).toHaveBeenCalledWith(secondHash);
      expect(singleTransactionFetchHashSpy).toHaveBeenCalledTimes(2);
      expect(res).toEqual([
        MockTransaction,
        {
          ...MockTransaction,
          transactionHash: secondHash,
        },
      ]);
    });
  });
});
