import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./LiveMatches.css";

const SOCKET_URL = "http://localhost:3001";

function LiveMatches() {
  const [matches, setMatches] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to socket server");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from socket server");
    });

    socket.on("matches:update", (updatedMatches) => {
      setMatches(updatedMatches);
      console.log("Received matches update:", updatedMatches);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const startSimulation = async () => {
    try {
      const response = await fetch(`${SOCKET_URL}/api/simulation/start`, {
        method: "POST",
      });
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error("Error starting simulation:", error);
    }
  };

  const stopSimulation = async () => {
    try {
      const response = await fetch(`${SOCKET_URL}/api/simulation/stop`, {
        method: "POST",
      });
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error("Error stopping simulation:", error);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "LIVE") {
      return <span className="badge live">LIVE</span>;
    } else if (status === "HT") {
      return <span className="badge halftime">HT</span>;
    } else if (status === "FT") {
      return <span className="badge finished">FT</span>;
    } else {
      return <span className="badge upcoming">UPCOMING</span>;
    }
    return null;
  };

  return (
    <div className="live-matches-container">
      <header className="header">
        <h1>⚽ FullTimeStats</h1>
        <p className="subtitle">
          Live Football Scores Across Europe's Top 5 Leagues
        </p>
        <div className="connection-status">
          {isConnected ? (
            <span className="status-connected">🟢 Connected</span>
          ) : (
            <span className="status-disconnected">🔴 Disconnected</span>
          )}
        </div>
      </header>

      <div className="controls">
        <button onClick={startSimulation} className="btn btn-primary">
          ▶️ Start Simulation
        </button>
        <button onClick={stopSimulation} className="btn btn-secondary">
          ⏹️ Stop Simulation
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="no-matches">
          <p>No live matches at the moment.</p>
          <p>Click "Start Simulation" to begin! 🚀</p>
        </div>
      ) : (
        <div className="matches-grid">
          {matches.map((match) => (
            <div
              key={match.id}
              className={`match-card ${match.status.toLowerCase()}`}
            >
              <div className="match-header">
                <span className="league-name">{match.league}</span>
                {getStatusBadge(match.status)}
                <span className="match-time">{match.minute}'</span>
              </div>

              <div className="match-content">
                <div className="team home-team">
                  <img
                    src={match.homeLogo}
                    alt={match.homeTeam}
                    className="team-logo"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <span className="team-name">{match.homeTeam}</span>
                </div>

                <div className="score">
                  <span className="score-number">{match.homeScore}</span>
                  <span className="score-separator">-</span>
                  <span className="score-number">{match.awayScore}</span>
                </div>

                <div className="team away-team">
                  <img
                    src={match.awayLogo}
                    alt={match.awayTeam}
                    className="team-logo"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <span className="team-name">{match.awayTeam}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LiveMatches;
