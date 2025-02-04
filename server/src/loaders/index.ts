import express, { Express } from "express";

import routes from "../routes";

export default ({ expressApp }: { expressApp: Express }) => {
  expressApp.use(express.json());
  expressApp.use("/fetcher", routes());
};
