const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const VOTES_FILE = path.join(__dirname, "votes.json");

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

function readVotes() {
  try {
    if (fs.existsSync(VOTES_FILE)) return JSON.parse(fs.readFileSync(VOTES_FILE, "utf-8"));
  } catch (e) { console.error("Read error:", e.message); }
  return {};
}

function writeVotes(data) {
  try { fs.writeFileSync(VOTES_FILE, JSON.stringify(data), "utf-8"); return true; }
  catch (e) { console.error("Write error:", e.message); return false; }
}

if (!fs.existsSync(VOTES_FILE)) { writeVotes({}); console.log("Created votes.json"); }

app.get("/api/ping", (req, res) => {
  res.json({ ok: true, n: Object.keys(readVotes()).length });
});

app.get("/api/votes", (req, res) => {
  console.log("GET votes");
  res.json(readVotes());
});

app.post("/api/votes", (req, res) => {
  const { personId, activityId } = req.body;
  console.log("TOGGLE", personId, activityId);
  if (!personId || activityId === undefined) return res.status(400).json({ error: "missing fields" });
  const key = personId + "-" + activityId;
  const votes = readVotes();
  if (votes[key]) delete votes[key]; else votes[key] = true;
  writeVotes(votes);
  res.json(votes);
});

app.delete("/api/votes", (req, res) => {
  writeVotes({});
  res.json({});
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("🌴 GWADA GUIDE running on port " + PORT);
});
