const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cheerio = require("cheerio");
const fs = require("fs");

const username = "Chitundu15"; // Your GitHub username
const readmePath = "./README.md";

(async () => {
  const res = await fetch(`https://github.com/users/${username}/contributions`, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
  }
});

  const html = await res.text();
  const $ = cheerio.load(html);
  const rects = $('rect[data-date]'); // This must work

  const contributions = [];

  rects.each((_, el) => {
    const date = $(el).attr("data-date");
    const count = parseInt($(el).attr("data-count") || "0", 10);
    contributions.push({ date, count });
  });

  // Print last 10 contributions to debug
  console.log("🧪 Last 10 contribution days:");
  contributions.slice(-10).forEach(c => console.log(`${c.date}: ${c.count}`));

  // Calculate current streak (from latest date backwards)
  let streak = 0;
  for (let i = contributions.length - 1; i >= 0; i--) {
    if (contributions[i].count > 0) {
      streak++;
    } else {
      break;
    }
  }

  const newStreakLine = `🔥 GitHub Streak: **${streak} day${streak === 1 ? "" : "s"}**`;

  // Read README.md
  const readme = fs.readFileSync(readmePath, "utf-8");

  const updatedReadme = readme.replace(
    /<!-- GITHUB_STREAK_START -->([\s\S]*?)<!-- GITHUB_STREAK_END -->/,
    `<!-- GITHUB_STREAK_START -->\n${newStreakLine}\n<!-- GITHUB_STREAK_END -->`
  );

  fs.writeFileSync(readmePath, updatedReadme);
  console.log(`✅ Streak updated to: ${streak} day(s)`);
})();
