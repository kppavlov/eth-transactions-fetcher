export default {
  port: parseInt(process.env.API_PORT || "3000", 10),
  ethNodeUrl: process.env.ETH_NODE_URL || "",
  dbConnectionUrl: process.env.DB_CONNECTION_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
};
