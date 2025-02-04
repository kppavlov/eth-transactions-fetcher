import PgConnect from "../pg-connect";
import { hashPassword } from "../../utils";
import { AuthenticationRequestBody } from "../../routes/types";

export interface IUser {
  id: string;
  username: string;
  password: string | null;
}

export class UserEntity implements IUser {
  id: string;
  username: string;
  password: string;

  constructor({ password, username }: AuthenticationRequestBody) {
    this.username = username;
    this.password = password;
    this.id = crypto.randomUUID();
  }

  async save() {
    const hashedPassword = await hashPassword(this.password);
    const res = await PgConnect.query<UserEntity>(
      "INSERT INTO users VALUES($1, $2, $3) ON CONFLICT(username) DO UPDATE SET username = EXCLUDED.username;",
      [this.id, this.username, hashedPassword],
    );

    return res[0];
  }

  static async findOne(username: string) {
    return (
      await PgConnect.query<IUser>(
        "SELECT password, username, id FROM users WHERE username = $1;",
        [username],
      )
    )[0];
  }
}
