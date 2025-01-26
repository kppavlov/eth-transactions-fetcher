import PgConnect from "./pg-connect";
import {
  InitTables,
  UsersTable,
  UserTransactionsTable,
} from "./scripts/init-tables";
import { UserEntity } from "./entities/user";

async function initializeTables() {
  try {
    await PgConnect.query(InitTables);
    await PgConnect.query(UsersTable);
    await PgConnect.query(UserTransactionsTable);

    const users = [
      new UserEntity({ password: "alice", username: "alice" }),
      new UserEntity({ password: "bob", username: "bob" }),
      new UserEntity({ password: "carol", username: "carol" }),
      new UserEntity({ password: "dave", username: "dave" }),
    ];

    for (const user of users) {
      await user.save();
    }
  } catch (e) {
    console.log(e);
  }
}

export default initializeTables;
