import { QueryResult } from "pg";

export const queryMock: QueryResult = {
  rows: [],
  command: "",
  oid: 123,
  fields: [
    {
      format: "asd",
      columnID: 1,
      dataTypeID: 1,
      dataTypeModifier: 1,
      dataTypeSize: 1,
      name: "",
      tableID: 1,
    },
  ],
  rowCount: 0,
};
