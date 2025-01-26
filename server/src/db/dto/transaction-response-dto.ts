import { TransactionEntity } from "../entities/transaction";
import { TransactionReceipt, TransactionResponse, toQuantity } from "ethers";

export class TransactionResponseDto extends TransactionEntity {
  constructor(
    transactionRes: TransactionResponse,
    transactionReceipt: TransactionReceipt,
  ) {
    super({
      blockHash: transactionRes?.blockHash ?? null,
      from: transactionRes.from,
      to: transactionRes.to,
      blockNumber: transactionRes.blockNumber,
      transactionHash: transactionRes.hash,
      logsCount: transactionReceipt.logs.length,
      contractAddress: transactionReceipt.contractAddress,
      transactionStatus: transactionReceipt.status as number,
      input: transactionRes.data,
      value: toQuantity(transactionRes.value),
    });
  }
}
