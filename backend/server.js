const express = require("express");
//const cors = require("cors");
//const dotenv = require("dotenv");
const pool = require("./db/config");
const { createServer } = require("http");
const { Server } = require("socket.io");

const footballApi = require("./services/footballApi");
const MatchSimulator = require("./services/matchSimulator");
const { version } = require("os");
const { start } = require("repl");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

const simulator = new MatchSimulator(io);

app.get("/", (req, res) => {
  res.json({
    message: "FullTimeStats API is running",
    version: "1.0.0",
    endpoints: {
      testDb: "/api/test-db",
      testFootball: "/api/test-football",
      matches: "/api/matches/:leagueId",
      liveMatches: "/api/live-matches",
      startSimulation: "/api/simulation/start",
      stopSimulation: "/api/simulation/stop",
    },
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      success: true,
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

app.get("/api/test-football", async (req, res) => {
  try {
    const standings = await footballApi.getLeagueStandings(
      footballApi.LEAGUES.PREMIER_LEAGUE
    );
    res.json({
      success: true,
      data: standings,
      message:
        "Successfully fetched Premier League standings from Football API",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch data from Football API",
      error: error.message,
    });
  }
});

app.get("/api/matches/:leagueId", async (req, res) => {
  try {
    const { leagueId } = req.params;
    const fromDate = req.query.from || "2022-12-26"; // Boxing Day!
    const toDate = req.query.to || "2022-12-31";

    const matches = await footballApi.getMatchesByDateRange(
      leagueId,
      fromDate,
      toDate
    );

    res.json({
      success: true,
      data: matches,
      message: `Successfully fetched for league ${leagueId} matches from ${fromDate} to ${toDate}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch matches from Football API",
      error: error.message,
    });
  }
});

app.get("/api/live-matches", async (req, res) => {
  const matches = simulator.getActiveMatches();
  res.json({
    success: true,
    count: matches.length,
    matches: matches,
  });
});

app.post("/api/simulation/start", async (req, res) => {
  try {
    await simulator.startSimulation();
    res.json({
      success: true,
      message: "Match simulation started",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to start match simulation",
      error: error.message,
    });
  }
});

app.post("/api/simulation/stop", (req, res) => {
  simulator.stopSimulation();
  res.json({
    success: true,
    message: "Match simulation stopped",
  });
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.emit("matches:update", simulator.getActiveMatches());

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.io server running`);
});
