import { ethers, RlpStructuredData } from "ethers";
import { Buffer } from "node:buffer";

function asciiHexToRawHex(asciiHex: string): string {
  return Buffer.from(asciiHex.slice(2), "hex").toString("utf-8"); // Remove "0x" and decode
}

function decodeRLP(encodedHex: string): string | string[] {
  // Ensure "0x" prefix
  if (!encodedHex.startsWith("0x")) {
    encodedHex = "0x" + encodedHex;
  }

  // Decode RLP
  const decoded = ethers.decodeRlp(encodedHex);

  // Check if decoded result is an array or a single value
  if (Array.isArray(decoded)) {
    // Convert each item in the array
    return decoded.map((item: any) =>
      typeof item === "string" && item.startsWith("0x30")
        ? asciiHexToRawHex(item)
        : item,
    );
  } else if (typeof decoded === "string" && decoded.startsWith("0x30")) {
    return asciiHexToRawHex(decoded);
  }

  return decoded; // Return as-is if no conversion is needed
}

export const getRlpHexOrError = (rlpHex: string): RlpStructuredData | Error => {
  const rlpRegex = new RegExp(/^(0x)?[0-9a-fA-F]+$/);

  if (!rlpRegex.test(rlpHex)) {
    return new Error("Invalid format: 'rlp' must be a valid hex string.");
  }

  const decoded = decodeRLP(rlpHex);

  if (Array.isArray(decoded)) {
    const areAllValuesWithCorrectForm = decoded.every((transactionHash) =>
      rlpRegex.test(transactionHash),
    );

    if (!areAllValuesWithCorrectForm) {
      return new Error(
        "Not all provided values are correct transaction hashes",
      );
    }

    return decoded;
  }

  return decoded;
};
