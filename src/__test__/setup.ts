import mongoose from "mongoose";
import { connectDatabaseTest } from "../database/mongodb";
import { MenuModel } from "../model/menu.model";

beforeAll(async () => {
  await connectDatabaseTest();
  // Ensure stale unique index definitions do not persist in test DB.
  await MenuModel.syncIndexes();
});

afterAll(async () => {
  await mongoose.connection.close();
});
