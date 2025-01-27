import { IUser, UserEntity } from "../db/entities/user";
import { AuthenticationRequestBody } from "../routes/types";

import jwt from "jsonwebtoken";

import envConfig from "../config";
import { verifyPassword } from "../utils";

export class UserService {
  async verifyUserCredentials(credentials: AuthenticationRequestBody) {
    try {
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
    } catch (e) {
      return Promise.reject(e);
    }
  }

  createJwtToken(user: IUser) {
    try {
      return jwt.sign(user, envConfig.jwtSecret);
    } catch (e) {
      throw e;
    }
  }

  verifyJwtToken(token: string): IUser {
    try {
      return jwt.verify(token, envConfig.jwtSecret) as IUser;
    } catch (e) {
      throw e;
    }
  }

  async getUserIfExists(username: string) {
    try {
      return await UserEntity.findOne(username);
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
