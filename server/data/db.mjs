import sqlite from "sqlite3";

const database_path = "./data/";
const db = new sqlite.Database(database_path + "database.sqlite", (err) => {
  if (err) throw err;
});

export default db;
