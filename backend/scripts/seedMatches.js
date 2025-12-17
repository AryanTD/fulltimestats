const footballApi = require("../services/footballApi"); // Import footballApi module
const pool = require("../db/config"); // Import database pool

// Seed matches from API-Football into the database

async function seedMatches() {
  console.log("🌱 Starting to seed matches from API-Football...\n");

  const leagues = [
    { id: footballApi.LEAGUES.PREMIER_LEAGUE, name: "Premier League" },
    { id: footballApi.LEAGUES.LA_LIGA, name: "La Liga" },
    { id: footballApi.LEAGUES.BUNDESLIGA, name: "Bundesliga" },
    { id: footballApi.LEAGUES.SERIE_A, name: "Serie A" },
    { id: footballApi.LEAGUES.LIGUE_1, name: "Ligue 1" },
  ];

  let totalMatches = 0;
  let totalApiCalls = 0;

  try {
    // Test database connection first
    await pool.query("SELECT NOW()");
    console.log("✅ Database connected\n");

    for (const league of leagues) {
      console.log(`📥 Fetching matches for ${league.name}...`);

      const data = await footballApi.getMatchesByDateRange(
        league.id,
        "2022-12-26",
        "2022-12-31"
      );

      totalApiCalls++;

      const matches = data.response || [];
      console.log(`   Found ${matches.length} matches`);

      if (matches.length === 0) {
        console.log(`   ⚠️  No matches found for ${league.name}\n`);
        continue;
      }

      // Save each match to database
      let savedCount = 0;
      for (const match of matches) {
        try {
          // Log first match data to see structure
          if (savedCount === 0) {
            console.log("   📋 Sample match data:", {
              id: match.fixture.id,
              home: match.teams.home.name,
              away: match.teams.away.name,
              venue: match.venue?.name || "Unknown",
            });
          }

          const result = await pool.query(
            `
            INSERT INTO matches (
              api_id, 
              league_id, 
              league_name,
              home_team_name, 
              away_team_name,
              home_team_logo, 
              away_team_logo, 
              home_score, 
              away_score, 
              match_date,
              venue,
              status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (api_id) DO NOTHING
            RETURNING id
          `,
            [
              match.fixture.id,
              league.id,
              league.name,
              match.teams.home.name,
              match.teams.away.name,
              match.teams.home.logo,
              match.teams.away.logo,
              match.goals.home,
              match.goals.away,
              match.fixture.date,
              match.venue?.name || "Unknown Venue",
              match.fixture.status.short,
            ]
          );

          if (result.rows.length > 0) {
            savedCount++;
            totalMatches++;
          }
        } catch (error) {
          console.error(
            `   ❌ Error saving match ${match.fixture.id}:`,
            error.message
          );
          console.error(`   📋 Match data:`, {
            fixture: match.fixture.id,
            home: match.teams.home.name,
            away: match.teams.away.name,
            homeScore: match.goals.home,
            awayScore: match.goals.away,
          });
        }
      }

      console.log(`   ✅ Saved ${savedCount} matches for ${league.name}\n`);
    }

    console.log("═══════════════════════════════════════");
    console.log("🎉 Seeding Complete!");
    console.log(`📊 Total matches saved: ${totalMatches}`);
    console.log(`🔌 Total API calls used: ${totalApiCalls}/100`);
    console.log("═══════════════════════════════════════\n");

    // Show some sample data
    const sampleMatches = await pool.query("SELECT * FROM matches LIMIT 3");
    console.log("📋 Sample matches in database:");
    if (sampleMatches.rows.length === 0) {
      console.log("   ⚠️  No matches found in database!");
    } else {
      sampleMatches.rows.forEach((match) => {
        console.log(
          `   ${match.home_team_name} ${match.home_score}-${match.away_score} ${match.away_team_name} (${match.league_name})`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error during seeding:", error.message);
    console.error("❌ Full error:", error);
  } finally {
    // Close database connection
    await pool.end();
    console.log("\n✅ Database connection closed");
    process.exit(0);
  }
}

// Run the seed function
seedMatches();
