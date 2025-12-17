//Importing the pg library to interact with PostgreSQL
const { Pool } = require("pg");
//Loading environment variables from .env file
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
  console.log("Connected to the database");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});
module.exports = pool;
