import { ethers, RlpStructuredData } from "ethers";

export const isValidRlpHex = (
  rlpHex: string,
): RlpStructuredData | { error: string } => {
  const isHex = ethers.isHexString(rlpHex);

  if (!isHex) {
    return { error: "Not a valid hex string" };
  }

  const decoded = ethers.decodeRlp(rlpHex);

  if (Array.isArray(decoded)) {
    const areAllValuesWithCorrectForm = decoded.every((transactionHash) =>
      ethers.isHexString(transactionHash, 32),
    );

    if (!areAllValuesWithCorrectForm) {
      return {
        error: "Not all provided values are correct transaction hashes",
      };
    }

    return decoded;
  }

  if (!ethers.isHexString(decoded, 32)) {
    return { error: "Invalid value for hex string." };
  }

  return decoded;
};
