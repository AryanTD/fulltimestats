-- Users table (for authentication)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leagues table (Premier League, La Liga, etc.)
CREATE TABLE leagues (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  logo_url TEXT,
  season INTEGER NOT NULL
);

-- Teams table
CREATE TABLE teams (
  id INTEGER PRIMARY KEY,
  league_id INTEGER REFERENCES leagues(id),
  name VARCHAR(100) NOT NULL,
  short_code VARCHAR(10),
  logo_url TEXT,
  founded INTEGER
);

-- Matches table
CREATE TABLE matches (
  id INTEGER PRIMARY KEY,
  league_id INTEGER REFERENCES leagues(id),
  home_team_id INTEGER REFERENCES teams(id),
  away_team_id INTEGER REFERENCES teams(id),
  match_date TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'upcoming', 'live', 'finished'
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  venue VARCHAR(100)
);

-- Players table
CREATE TABLE players (
  id INTEGER PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id),
  name VARCHAR(100) NOT NULL,
  position VARCHAR(50),
  nationality VARCHAR(50),
  photo_url TEXT
);

-- User favorite teams (many-to-many relationship)
CREATE TABLE user_favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, team_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_matches_league ON matches(league_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_teams_league ON teams(league_id);
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);