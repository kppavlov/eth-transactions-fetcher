import { Router } from "express";

import ethRoute from "./eth-route";
import allRoute from "./all-route";
import authenticateRoute from "./authenticate-route";
import myRoute from "./my-route";

export default (): Router => {
  const router = Router();

  ethRoute(router);
  allRoute(router);
  authenticateRoute(router);
  myRoute(router);

  return router;
};
