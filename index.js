import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Roblox verification endpoint
app.post("/verify", async (req, res) => {
  const { username, phrase } = req.body;

  if (!username || !phrase)
    return res.status(400).json({ ok: false, error: "Missing username or phrase" });

  try {
    // Step 1: Find Roblox user by username
    const lookup = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username.trim()] }),
    });
    const data = await lookup.json();

    if (!data.data?.length)
      return res.status(404).json({ ok: false, error: "User not found" });

    const user = data.data[0];

    // Step 2: Get user's bio (description)
    const info = await fetch(`https://users.roblox.com/v1/users/${user.id}`);
    const json = await info.json();

    const description = json.description?.toLowerCase() || "";
    const match = description.includes(phrase.toLowerCase());

    res.json({
      ok: match,
      id: user.id,
      username: user.name,
      description,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// ✅ Start the backend
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
