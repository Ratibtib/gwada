const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const VOTES_FILE = path.join(__dirname, "votes.json");

app.use(cors());
app.use(express.json());

// ── Helpers ──────────────────────────────────────────────
function readVotes() {
  try {
    if (fs.existsSync(VOTES_FILE)) {
      return JSON.parse(fs.readFileSync(VOTES_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading votes:", e);
  }
  return {};
}

function writeVotes(data) {
  try {
    fs.writeFileSync(VOTES_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing votes:", e);
  }
}

// ── API Routes ───────────────────────────────────────────

// Get all votes
app.get("/api/votes", (req, res) => {
  res.json(readVotes());
});

// Toggle a vote
app.post("/api/votes", (req, res) => {
  const { personId, activityId } = req.body;
  if (!personId || activityId === undefined) {
    return res.status(400).json({ error: "personId and activityId required" });
  }
  const key = `${personId}-${activityId}`;
  const votes = readVotes();
  if (votes[key]) {
    delete votes[key];
  } else {
    votes[key] = true;
  }
  writeVotes(votes);
  res.json(votes);
});

// Reset all votes
app.delete("/api/votes", (req, res) => {
  writeVotes({});
  res.json({});
});

// Serve index.html from the SAME folder (no /public needed)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("🌴 Gwada Guide running on port " + PORT);
});
