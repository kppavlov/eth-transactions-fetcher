import { ethers } from "ethers";
import envConfig from "../config";

export const rpcProvider = new ethers.JsonRpcProvider(
  envConfig.ethNodeUrl,
  "sepolia",
);
