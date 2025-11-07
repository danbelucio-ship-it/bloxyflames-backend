import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// ✅ Directory setup for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ CORS configuration (frontend + local dev)
app.use(
  cors({
    origin: [
      "https://bloxyflames.com",
      "https://www.bloxyflames.com",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Health check (optional)
app.get("/api/health", (req, res) => {
  res.status(200).send("✅ BloxyFlames backend + frontend are running fine!");
});

// ✅ Roblox OAuth callback
app.get("/auth/callback", async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing authorization code");

    const tokenRes = await fetch("https://apis.roblox.com/oauth/v1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.ROBLOX_CLIENT_ID,
        client_secret: process.env.ROBLOX_CLIENT_SECRET,
        redirect_uri: process.env.ROBLOX_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();
    res.status(200).json(tokenData);
  } catch (error) {
    console.error("OAuth Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ✅ Serve the frontend build
app.use(express.static(path.join(__dirname, "dist")));

// ✅ Always return React index.html for any unknown route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ BloxyFlames full stack running on port ${PORT}`);
});
