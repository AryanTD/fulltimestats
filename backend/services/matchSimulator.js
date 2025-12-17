const pool = require("../db/config");

class MatchSimulator {
  constructor(io) {
    this.io = io;
    this.activeMatches = [];
    this.simulationInterval = null;
  }

  /**
   * Start simulating live matches using DATABASE
   */
  async startSimulation() {
    try {
      console.log("🎮 Starting match simulation from DATABASE...");

      // Fetch random matches from database
      const result = await pool.query(`
        SELECT * FROM matches 
        ORDER BY RANDOM() 
        LIMIT 6
      `);

      const matches = result.rows;

      if (matches.length === 0) {
        console.log(
          "❌ No matches found in database. Please run: node scripts/seedMatches.js"
        );
        return;
      }

      console.log(
        `✅ Loaded ${matches.length} matches from database (0 API calls used!)`
      );

      // Initialize matches for simulation
      this.activeMatches = matches.map((match) => ({
        id: match.api_id,
        league: match.league_name,
        homeTeam: match.home_team_name,
        awayTeam: match.away_team_name,
        homeScore: 0,
        awayScore: 0,
        finalHomeScore: match.home_score,
        finalAwayScore: match.away_score,
        minute: 0,
        status: "LIVE",
        homeLogo: match.home_team_logo,
        awayLogo: match.away_team_logo,
      }));

      console.log(`⚽ Simulating ${this.activeMatches.length} matches`);

      // Emit initial state
      this.io.emit("matches:update", this.activeMatches);

      // Start the simulation loop
      this.simulationInterval = setInterval(() => {
        this.updateMatches();
      }, 2000); // Update every 2 seconds
    } catch (error) {
      console.error("❌ Error starting simulation:", error.message);
    }
  }

  /**
   * Update match state (increment time, add goals)
   */
  updateMatches() {
    let hasChanges = false;

    this.activeMatches = this.activeMatches.map((match) => {
      // Skip if match is finished
      if (match.status === "FT") {
        return match;
      }

      // Increment minute
      match.minute += 1;

      // Check if we should add a goal
      if (this.shouldScoreGoal(match)) {
        const team = Math.random() > 0.5 ? "home" : "away";

        if (team === "home" && match.homeScore < match.finalHomeScore) {
          match.homeScore += 1;
          console.log(
            `⚽ GOAL! ${match.homeTeam} scores! (${match.homeScore}-${match.awayScore})`
          );
          hasChanges = true;
        } else if (team === "away" && match.awayScore < match.finalAwayScore) {
          match.awayScore += 1;
          console.log(
            `⚽ GOAL! ${match.awayTeam} scores! (${match.homeScore}-${match.awayScore})`
          );
          hasChanges = true;
        }
      }

      // Half-time at 45 minutes
      if (match.minute === 45) {
        match.status = "HT";
        console.log(
          `⏸️  Half-time: ${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam}`
        );
        hasChanges = true;
      }

      // Resume after half-time
      if (match.minute === 46) {
        match.status = "LIVE";
        hasChanges = true;
      }

      // Full-time at 90 minutes
      if (match.minute >= 90) {
        match.minute = 90;
        match.status = "FT";
        match.homeScore = match.finalHomeScore;
        match.awayScore = match.finalAwayScore;
        console.log(
          `🏁 Full-time: ${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam}`
        );
        hasChanges = true;
      }

      return match;
    });

    // Emit updates if something changed
    if (hasChanges) {
      this.io.emit("matches:update", this.activeMatches);
    }

    // Check if all matches are finished
    const allFinished = this.activeMatches.every((m) => m.status === "FT");
    if (allFinished) {
      console.log(
        "✅ All matches finished! Starting new simulation in 10 seconds..."
      );
      clearInterval(this.simulationInterval);

      // Start new simulation after 10 seconds
      setTimeout(() => {
        this.startSimulation();
      }, 10000);
    }
  }

  /**
   * Determine if a goal should be scored this minute
   */
  shouldScoreGoal(match) {
    // Calculate how many goals still need to be scored
    const remainingHomeGoals = match.finalHomeScore - match.homeScore;
    const remainingAwayGoals = match.finalAwayScore - match.awayScore;
    const totalRemainingGoals = remainingHomeGoals + remainingAwayGoals;

    // No more goals to score
    if (totalRemainingGoals === 0) {
      return false;
    }

    // Calculate minutes remaining
    const minutesRemaining = 90 - match.minute;

    // Probability increases as we get closer to end of match
    const baseProbability = totalRemainingGoals / minutesRemaining;

    // Random chance based on probability
    return Math.random() < baseProbability * 0.5;
  }

  /**
   * Stop simulation
   */
  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
      console.log("⏹️  Simulation stopped");
    }
  }

  /**
   * Get current active matches
   */
  getActiveMatches() {
    return this.activeMatches;
  }
}

module.exports = MatchSimulator;
