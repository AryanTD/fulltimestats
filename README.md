# FullTimeStats ⚽

Real-time football analytics dashboard for Europe's top 5 leagues.

## 🏆 Features

- Live match scores with WebSocket updates
- League standings for Premier League, La Liga, Bundesliga, Serie A, and Ligue 1
- Team statistics and comparisons
- Player performance tracking
- User authentication with favorite teams
- Interactive data visualizations

## 🛠️ Tech Stack

**Backend:**

- Node.js + Express
- PostgreSQL
- Socket.io (WebSockets)
- JWT Authentication

**Frontend:** (Coming soon)

- React + TypeScript
- Tailwind CSS
- Chart.js

## 📦 Setup

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)

### Installation

1. Clone the repository

```bash
git clone https://github.com/AryanTD/fulltimestats.git
cd fulltimestats
```

2. Install backend dependencies

```bash
cd backend
npm install
```

3. Create `.env` file in backend folder

```
PORT=3001
DATABASE_URL=postgresql://localhost:5432/fulltimestats
```

4. Create database and tables

```bash
psql postgres
CREATE DATABASE fulltimestats;
\q

psql fulltimestats < db/schema.sql
```

5. Start the server

```bash
npm run dev
```

Server runs on `http://localhost:3001`

## 🚀 API Endpoints

- `GET /` - API status
- `GET /api/test-db` - Test database connection

More endpoints coming soon!

## 📝 Project Status

🚧 **Currently in development**

- [x] Backend setup
- [x] Database schema
- [x] Server-database connection
- [ ] Football API integration
- [ ] User authentication
- [ ] Frontend development
- [ ] Real-time updates
- [ ] Deployment

## 👤 Author

Aryan Tandon - CS Masters Student

## 📄 License

MIT
