const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./db/config");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to FullTimeStats API",
    status: "Server is running",
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Database connection successful",
      time: result.rows[0].now,
    });
  } catch (err) {
    console.error("Database Error: ", err);
    res.status(500).json({
      message: "Database connection failed",
      error: err.message,
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
