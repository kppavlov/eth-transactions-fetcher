export const InitTables = `
CREATE TABLE IF NOT EXISTS transactions (
    "transactionHash" TEXT PRIMARY KEY,
    "transactionStatus" SMALLINT CHECK ("transactionStatus" IN (0, 1)),
    "blockHash" TEXT CHECK ("blockHash" ~ '^0x[0-9a-fA-F]+$'),
    "blockNumber" INTEGER NOT NULL,
    "from" TEXT CHECK ("from" ~ '^0x[0-9a-fA-F]+$'),
    "to" TEXT NULL CHECK ("to" IS NULL OR "to" ~ '^0x[0-9a-fA-F]+$'),
    "contractAddress" TEXT CHECK ("contractAddress" ~ '^0x[0-9a-fA-F]+$'),
    "logsCount" INTEGER NOT NULL,
    input TEXT NOT NULL,
    value TEXT NOT NULL
);
`;

export const UsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);
`;

export const UserTransactionsTable = `
CREATE TABLE IF NOT EXISTS user_transactions (
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Foreign key to users
    "transactionHash" TEXT NOT NULL REFERENCES transactions("transactionHash") ON DELETE CASCADE, -- Foreign key to transactions
    PRIMARY KEY ("userId", "transactionHash") -- Composite primary key
);
`;
