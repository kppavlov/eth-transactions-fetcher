import { Request } from "express";
import { Hash, Hashes } from "../db/types";
import { Query, ParamsDictionary } from "express-serve-static-core";
import { RlpStructuredData } from "ethers";

export interface QueryParams extends Query {
  transactionHashes: Hashes | Hash;
}

type HexString = `0x${string}`;

type OptionalAuthHeader = {
  auth_token?: string;
};

export interface TransactionRlpRequestParams extends ParamsDictionary {
  rlPhex: HexString;
}

export interface MyRequest extends Request {
  headers: Request['headers'] & OptionalAuthHeader;
}

export interface TransactionHashesRequest extends Request {
  query: QueryParams;
  headers: Request['headers'] & OptionalAuthHeader;
}

export interface TransactionRlpRequest extends Request {
  params: TransactionRlpRequestParams;
  decodedRlpHex?: RlpStructuredData;
  headers: Request['headers'] & OptionalAuthHeader;
}

export type AuthenticationRequestBody = {
  username: string;
  password: string;
};

export interface AuthenticationRequest extends Request {
  body: AuthenticationRequestBody;
}
