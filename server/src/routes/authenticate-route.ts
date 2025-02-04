import { Router } from "express";
import {
  authenticateCredentialsValidator,
  authenticateCredentialsValidatorHandler,
} from "./validators/authenticate-validator";
import { AuthenticationRequest } from "./types";
import { UserService } from "../services/user-service";

const innerRoute = Router();

export default (outerRoute: Router) => {
  outerRoute.use("/authenticate", innerRoute);

  innerRoute.post(
    "/",
    authenticateCredentialsValidator(),
    authenticateCredentialsValidatorHandler,
    async (req: AuthenticationRequest, res) => {
      try {
        const { username, password } = req.body;
        const userService = new UserService();

        const user = await userService.verifyUserCredentials({
          username,
          password,
        });

        if (!user) {
          res.status(400).send(new Error("Invalid credentials"));
          return;
        }

        const token = userService.createJwtToken(user);

        res.status(200).send({ token });
      } catch (e) {
        res.status(500).send(e);
      }
    },
  );
};
