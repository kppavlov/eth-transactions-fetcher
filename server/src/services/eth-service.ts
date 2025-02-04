import { JsonRpcProvider } from "ethers";
import { Hash, Hashes } from "../db/types";
import { ITransaction, TransactionEntity } from "../db/entities/transaction";
import { TransactionResponseDto } from "../db/dto/transaction-response-dto";
import { IUser } from "../db/entities/user";

export class EthService {
  rpcProvider: JsonRpcProvider;
  jwtDecodedToken?: IUser;

  constructor(rpcProvider: JsonRpcProvider, jwtDecodedToken?: IUser) {
    this.rpcProvider = rpcProvider;
    this.jwtDecodedToken = jwtDecodedToken;
  }

  async getAllSavedTransactions(): Promise<ITransaction[]> {
    return await TransactionEntity.getAll();
  }

  async getAllFetchedTransactionsPerPerson(): Promise<TransactionEntity[]> {
    if (!this.jwtDecodedToken) {
      return Promise.reject(new Error("No decoded token provided"));
    }

    return await TransactionEntity.getAllPersonal(this.jwtDecodedToken.id);
  }

  async getTransactionsByHash(arg: Hash | Hashes): Promise<ITransaction[]> {
    if (Array.isArray(arg)) {
      return await this.handleMultipleTransactionHashes(arg);
    }

    const transaction = await this.handleSingleTransactionHash(arg);
    return transaction ? [transaction] : [];
  }

  async handleSingleTransactionHash(hash: Hash) {
    return await this.fetchAndSaveSingleTransaction(hash);
  }

  async handleMultipleTransactionHashes(hashes: Hashes) {
    return await this.fetchAndSaveTransactions(hashes);
  }

  async fetchAndSaveSingleTransaction(hash: Hash) {
    const memoizedTransaction =
      TransactionEntity.memoizedTransactions.get(hash);

    if (memoizedTransaction) {
      if (!memoizedTransaction.hasBeenSaved && this.jwtDecodedToken) {
        await new TransactionEntity(memoizedTransaction).save(
          this.jwtDecodedToken,
        );
        TransactionEntity.memoizedTransactions.set(hash, {
          ...memoizedTransaction,
          hasBeenSaved: true,
        });
      }

      return { ...memoizedTransaction, hasBeenSaved: undefined };
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

  async fetchAndSaveTransactions(hashes: Hashes) {
    let transactions: ITransaction[] = [];

    // maybe a bulk fetch is available in ethers.js???
    for await (const transactionHash of hashes) {
      const transaction =
        await this.fetchAndSaveSingleTransaction(transactionHash);

      if (!transaction) {
        continue;
      }

      transactions.push(transaction);
    }

    return transactions;
  }
}
