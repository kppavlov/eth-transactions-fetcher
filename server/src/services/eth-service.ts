import { JsonRpcProvider } from "ethers";
import { Hash, Hashes } from "../db/types";
import { TransactionEntity } from "../db/entities/transaction";
import { TransactionResponseDto } from "../db/dto/transaction-response-dto";
import { IUser } from "../db/entities/user";

export class EthService {
  rpcProvider: JsonRpcProvider;
  jwtDecodedToken?: IUser;

  constructor(rpcProvider: JsonRpcProvider, jwtDecodedToken?: IUser) {
    this.rpcProvider = rpcProvider;
    this.jwtDecodedToken = jwtDecodedToken;
  }

  async getAllSavedTransactions(): Promise<TransactionEntity[]> {
    try {
      return await TransactionEntity.getAll();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async getAllFetchedTransactionsPerPerson(): Promise<TransactionEntity[]> {
    try {
      if (!this.jwtDecodedToken) {
        return Promise.reject({ error: "No decoded token provided" });
      }
      console.log(this.jwtDecodedToken);
      return await TransactionEntity.getAllPersonal(this.jwtDecodedToken.id);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async getTransactionsByHash(
    arg: Hash | Hashes,
  ): Promise<TransactionEntity[]> {
    if (Array.isArray(arg)) {
      try {
        return await this.handleMultipleTransactionHashes(arg);
      } catch (e) {
        return Promise.reject(e);
      }
    }

    try {
      const transaction = await this.handleSingleTransactionHash(arg);
      return transaction ? [transaction] : [];
    } catch (e) {
      return Promise.reject(e);
    }
  }

  private async handleSingleTransactionHash(hash: Hash) {
    try {
      return await this.fetchSingleTransaction(hash);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  private async handleMultipleTransactionHashes(hashes: Hashes) {
    try {
      return await this.fetchTransactions(hashes);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  private async fetchSingleTransaction(hash: Hash) {
    if (TransactionEntity.memoizedTransactions.get(hash)) {
      return TransactionEntity.memoizedTransactions.get(hash);
    }

    const transaction = await this.rpcProvider.getTransaction(hash);
    const transactionReceipt =
      await this.rpcProvider.getTransactionReceipt(hash);

    if (!transactionReceipt || !transaction) {
      return;
    }

    return await new TransactionResponseDto(
      transaction,
      transactionReceipt,
    ).save(this.jwtDecodedToken);
  }

  private async fetchTransactions(hashes: Hashes) {
    let transactions: TransactionEntity[] = [];

    // maybe a bulk fetch is available in ethers.js???
    for await (const transactionHash of hashes) {
      const transaction = await this.fetchSingleTransaction(transactionHash);

      if (!transaction) {
        continue;
      }

      transactions.push(transaction);
    }

    return transactions;
  }
}
