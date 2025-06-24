const { GraphQLClient, gql } = require("graphql-request");
const fs = require("fs");

const username = "Chitundu15";
const token = process.env.GITHUB_TOKEN;
const readmePath = "./README.md";

const endpoint = "https://api.github.com/graphql";

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${token}`,
  },
});

const query = gql`
  query ($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

(async () => {
  try {
    const data = await graphQLClient.request(query, { username });

    const days = data.user.contributionsCollection.contributionCalendar.weeks
      .flatMap(week => week.contributionDays)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Debug last 10 days
    console.log("🧪 Last 10 contribution days:");
    days.slice(-14).forEach(day => {
      console.log(`${day.date}: ${day.contributionCount}`);
    });

    // Calculate current streak
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].contributionCount > 0) {
        streak++;
      } else {
        break;
      }
    }

    const newStreakLine = `🔥 GitHub Streak: **${streak} day${streak === 1 ? "" : "s"}**`;

    const readme = fs.readFileSync(readmePath, "utf-8");
    const updatedReadme = readme.replace(
      /<!-- GITHUB_STREAK_START -->([\s\S]*?)<!-- GITHUB_STREAK_END -->/,
      `<!-- GITHUB_STREAK_START -->\n${newStreakLine}\n<!-- GITHUB_STREAK_END -->`
    );

    fs.writeFileSync(readmePath, updatedReadme);
    console.log(`✅ Streak updated to: ${streak} day(s)`);
  } catch (err) {
    console.error("❌ Error fetching contributions:", err);
  }
})();
