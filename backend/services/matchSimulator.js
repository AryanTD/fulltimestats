const footballApi = require("./footballApi");

class MatchSimulator {
  constructor(io) {
    this.io = io;
    this.activeMatches = [];
    this.simulationInterval = null;
  }

  async startSimulation(leagueId) {
    try {
      console.log("Starting match simulation !!!");

      const matchPromises = [
        this.fetchMatchesForLeagues(footballApi.LEAGUES.PREMIER_LEAGUE),
        "Premier League",
        this.fetchMatchesForLeagues(footballApi.LEAGUES.LA_LIGA),
        "La Liga",
        this.fetchMatchesForLeagues(footballApi.LEAGUES.SERIE_A),
        "Serie A",
        this.fetchMatchesForLeagues(footballApi.LEAGUES.BUNDESLIGA),
        "Bundesliga",
        this.fetchMatchesForLeagues(footballApi.LEAGUES.LIGUE_1),
        "Ligue 1",
      ];

      const allLeagueMatches = await Promise.all(matchPromises);

      const selectedMatches = this.selectRandomMatches(
        allLeagueMatches.flat(),
        4
      );

      this.activeMatches = selectedMatches.map((match) => ({
        id: match.fixture.id,
        league: match.league.name,
        homeTeam: match.teams.home.name,
        awayTeam: match.teams.away.name,
        homeScore: 0,
        awayScore: 0,
        finalHomeScore: match.goals.home,
        finalAwayScore: match.goals.away,
        minute: 0,
        status: "LIVE",
        homeLogo: match.teams.home.logo,
        awayLogo: match.teams.away.logo,
      }));

      console.log(`⚽ Simulating ${this.activeMatches.length} matches`);

      this.io.emit("matches:update", this.activeMatches);

      this.simulationInterval = setInterval(() => {
        this.updateMatchStates();
      }, 2000);
    } catch (error) {
      console.error("Error starting match simulation:", error.message);
    }
  }

  async fetchMatchesForLeagues(leagueId, leagueName) {
    try {
      const data = await footballApi.getMatchesByDateRange(
        leagueId,
        "2022-12-26",
        "2022-12-31"
      );
      const matches = data.response || [];

      return matches.map((match) => ({
        ...match,
        leagueName: leagueName,
      }));
    } catch (error) {
      console.error(
        `Error fetching matches for league ${leagueId}:`,
        error.message
      );
      return [];
    }
  }

  selectRandomMatches(allLeagueMatches, count) {
    const allMatches = allLeagueMatches.flat();
    const shuffled = allMatches.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  updateMatches() {
    let hasChanges = false;

    this.activeMatches = this.activeMatches.map((match) => {
      if (match.status === "FT") return match;

      match.minute += 1;

      if (this.shouldScoreGoal(match)) {
        const team = Math.random() < 0.5 ? "home" : "away";

        if (team === "home" && match.homeScore < match.finalHomeScore) {
          match.homeScore += 1;
          console.log(
            `Goal! ${match.homeTeam} scores! Current Score: ${match.homeScore}-${match.awayScore}`
          );
          hasChanges = true;
        } else if (team === "away" && match.awayScore < match.finalAwayScore) {
          match.awayScore += 1;
          console.log(
            `Goal! ${match.awayTeam} scores! Current Score: ${match.homeScore}-${match.awayScore}`
          );
          hasChanges = true;
        }
      }

      if (match.minute === 45) {
        match.status = "HT";
        console.log(`⏸️  Halftime in ${match.homeTeam} vs ${match.awayTeam}`);
        hasChanges = true;
      }

      if (match.minute === 46) {
        match.status = "LIVE";
        console.log(
          `Second half started in ${match.homeTeam} vs ${match.awayTeam}`
        );
        hasChanges = true;
      }

      if (match.minute >= 90) {
        match.status = "FT";
        match.minute = 90;
        match.homeScore = match.finalHomeScore;
        match.awayScore = match.finalAwayScore;
        console.log(
          `Fulltime in ${match.homeTeam} vs ${match.awayTeam}. Final Score: ${match.homeScore}-${match.awayScore}`
        );
        hasChanges = true;
      }

      return match;
    });

    if (hasChanges) {
      this.io.emit("matches:update", this.activeMatches);
    }

    const allFinished = this.activeMatches.every(
      (match) => match.status === "FT"
    );
    if (allFinished) {
      console.log(
        "All matches finished. Starting new simulation in 10 seconds..."
      );
      clearInterval(this.simulationInterval);

      setTimeout(() => {
        this.startSimulation();
      }, 10000);
    }
  }

  shouldScoreGoal(match) {
    const remainingHomeGoals = match.finalHomeScore - match.homeScore;
    const remainingAwayGoals = match.finalAwayScore - match.awayScore;
    const totalRemainingGoals = remainingHomeGoals + remainingAwayGoals;

    if (totalRemainingGoals === 0) {
      return false;
    }

    const minutesRemaining = 90 - match.minute;
    const baseProbability = totalRemainingGoals / minutesRemaining;

    return Math.random() < baseProbability * 0.5;
  }

  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
      console.log("Match simulation stopped.");
    }
  }

  getActiveMatches() {
    return this.activeMatches;
  }
}

module.exports = MatchSimulator;
