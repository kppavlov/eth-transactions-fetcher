import PgConnect from "../pg-connect";
import { Hash, QueryActions } from "../types";
import { IUser } from "./user";

interface ITransaction {
  transactionHash: Hash; // the hex encoded transaction hash of the transaction
  transactionStatus: number; // the status of the transaction either 1 (success) or 0 (failure)
  blockHash: Hash | null; // the hex encoding of the hash of the block the transaction was included in
  blockNumber: number | null; // the number of the block the transaction was included in
  from: Hash; // the ethereum address of the transaction sender
  to: Hash | null; // the ethereum address of the transaction receiver or null when its a contract creation transaction.
  contractAddress: Hash | null; // the ethereum address of the newly created contract if this transaction is contract creation
  logsCount: number; // number of log objects, which this transaction generated.
  input: string; // the hex encoding of the data send along with the transaction.
  value: string; // the value transferred in wei
}

interface TransactionType extends QueryActions {}

export class TransactionEntity implements TransactionType {
  transactionHash: Hash;
  transactionStatus: number;
  blockHash: Hash | null;
  from: Hash;
  to: Hash | null;
  contractAddress: Hash | null;
  logsCount: number;
  input: string;
  value: string;
  blockNumber: number | null;
  static memoizedTransactions: Map<Hash, TransactionEntity> = new Map();

  constructor({
    transactionHash,
    transactionStatus,
    blockHash,
    from,
    to,
    contractAddress,
    logsCount,
    input,
    value,
    blockNumber,
  }: ITransaction) {
    this.blockHash = blockHash;
    this.transactionStatus = transactionStatus;
    this.from = from;
    this.to = to;
    this.contractAddress = contractAddress;
    this.logsCount = logsCount;
    this.input = input;
    this.value = value;
    this.transactionHash = transactionHash;
    this.blockNumber = blockNumber;
  }

  static async getAll() {
    try {
      return await PgConnect.query<TransactionEntity>(
        "SELECT * FROM transactions",
      );
    } catch (e) {
      return Promise.reject(e);
    }
  }

  static async getAllPersonal(userId: string) {
    try {
      return await PgConnect.query<TransactionEntity>(
        `SELECT * FROM transactions as t JOIN user_transactions as ut ON t."transactionHash" = ut."transactionHash" AND ut."userId" = $1;`,
        [userId],
      );
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async save(decodedToken?: IUser) {
    const memoizedTransaction = TransactionEntity.memoizedTransactions.get(
      this.transactionHash,
    );

    if (memoizedTransaction) {
      return memoizedTransaction;
    }
    try {
      const res = await PgConnect.query<TransactionEntity>(
        `INSERT INTO transactions VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
          this.transactionHash,
          this.transactionStatus,
          this.blockHash,
          this.blockNumber,
          this.from,
          this.to,
          this.contractAddress,
          this.logsCount,
          this.input,
          this.value,
        ],
      );

      if (decodedToken) {
        await PgConnect.query("INSERT INTO user_transactions VALUES($1, $2)", [
          decodedToken.id,
          this.transactionHash,
        ]);
      }

      // this could be a call to memoize in a service like Redis
      TransactionEntity.memoizedTransactions.set(this.transactionHash, res[0]);

      return res[0];
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
