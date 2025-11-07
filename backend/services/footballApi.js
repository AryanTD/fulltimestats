const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.FOOTBALL_API_KEY;
const API_URL = process.env.FOOTBALL_API_URL;

const footballApi = axios.create({
  baseURL: API_URL,
  headers: {
    "x-rapidapi-key": API_KEY,
    "x-rapidapi-host": "v3.football.api-sports.io",
  },
});

const LEAGUES = {
  PREMIER_LEAGUE: 39,
  LA_LIGA: 140,
  SERIE_A: 135,
  BUNDESLIGA: 78,
  LIGUE_1: 61,
};

const CURRENT_SEASON = 2022;

// Get all leagues info
const getAllLeagues = async () => {
  try {
    const response = await footballApi.get("/leagues", {
      params: {
        current: true,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching leagues:", error.message);
    throw error;
  }
};

const getLeagueStandings = async (leagueId) => {
  try {
    const response = await footballApi.get("/standings", {
      params: {
        league: leagueId,
        season: CURRENT_SEASON,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching standings for league ${leagueId}:`,
      error.message
    );
    throw error;
  }
};

const getLiveMatches = async (leagueId) => {
  try {
    const response = await footballApi.get("/fixtures", {
      params: {
        league: leagueId,
        live: "all",
        season: CURRENT_SEASON,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching live matches for league ${leagueId}:`,
      error.message
    );
    throw error;
  }
};

const getMatchesByDate = async (leagueId, date) => {
  try {
    const response = await footballApi.get("/fixtures", {
      params: {
        league: leagueId,
        date: date,
        season: CURRENT_SEASON,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching matches for league ${leagueId} on date ${date}:`,
      error.message
    );
    throw error;
  }
};

const getAllLiveMatches = async () => {
  try {
    const liveMatches = [];
    for (const [name, id] of Object.entries(LEAGUES)) {
      const matches = await getLiveMatches(id);
      getAllLiveMatches.push({
        league: name,
        leagurId: id,
        matches: matches.response || [],
      });
    }
    return liveMatches;
  } catch (error) {
    console.error("Error fetching all live matches:", error.message);
    throw error;
  }
};

const getTeamsByLeague = async (leagueId) => {
  try {
    const response = await footballApi.get("/teams", {
      params: {
        league: leagueId,
        season: CURRENT_SEASON,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching teams for league ${leagueId}:`,
      error.message
    );
    throw error;
  }
};

const getTeamStats = async (teamId, leagueId) => {
  try {
    const response = await footballApi.get("/teams/statistics", {
      params: {
        team: teamId,
        league: leagueId,
        season: CURRENT_SEASON,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching stats for team ${teamId} in league ${leagueId}:`,
      error.message
    );
    throw error;
  }
};

const getTopScorers = async (leagueId) => {
  try {
    const response = await footballApi.get("/players/topscorers", {
      params: {
        league: leagueId,
        season: CURRENT_SEASON,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching top scorers for league ${leagueId}:`,
      error.message
    );
    throw error;
  }
};

const getPlayerStats = async (playerId, season) => {
  try {
    const response = await footballApi.get("/players", {
      params: {
        id: playerId,
        season: season || CURRENT_SEASON,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching stats for player ${playerId}:`,
      error.message
    );
    throw error;
  }
};

const getMatchesByDateRange = async (leagueId, fromDate, toDate) => {
  try {
    const response = await footballApi.get("/fixtures", {
      params: {
        league: leagueId,
        season: CURRENT_SEASON,
        from: fromDate,
        to: toDate,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching matches for league ${leagueId}`,
      error.message
    );
    throw error;
  }
};

module.exports = {
  LEAGUES,
  CURRENT_SEASON,
  getAllLeagues,
  getLeagueStandings,
  getLiveMatches,
  getMatchesByDate,
  getAllLiveMatches,
  getTeamsByLeague,
  getTeamStats,
  getTopScorers,
  getPlayerStats,
  getMatchesByDateRange,
};
