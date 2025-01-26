import express from "express";
import loaders from "./loaders";
import config from "./config";
import initializeTables from "./db/init";

// Create a new express application instance
const app = express();

async function start() {
  await initializeTables();

  loaders({ expressApp: app });

  // Start the Express server
  app.listen(config.port, () => {
    process.env.NODE_ENV !== "test" &&
      console.log(`The server is running at http://localhost:${config.port}`);
  });
}

(async () => await start())();

export default app;
