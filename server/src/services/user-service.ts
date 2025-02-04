import { IUser, UserEntity } from "../db/entities/user";
import { AuthenticationRequestBody } from "../routes/types";

import jwt from "jsonwebtoken";

import envConfig from "../config";
import { verifyPassword } from "../utils";

export class UserService {
  async verifyUserCredentials(credentials: AuthenticationRequestBody) {
    const { username, password } = credentials;
    const user = await UserEntity.findOne(username);

    if (!user) {
      return;
    }

    const { password: passwordFromDb } = user;

    if (!(await verifyPassword(password, passwordFromDb ?? ""))) {
      return Promise.reject("Wrong credentials");
    }

    return {
      ...user,
      password: null,
    };
  }

  createJwtToken(user: IUser) {
    return jwt.sign(user, envConfig.jwtSecret);
  }

  verifyJwtToken(token: string): IUser {
    return jwt.verify(token, envConfig.jwtSecret) as IUser;
  }

  async getUserIfExists(username: string) {
    return await UserEntity.findOne(username);
  }
}
