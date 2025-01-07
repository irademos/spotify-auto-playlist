const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = 5000;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/callback";

app.get("/login", (req, res) => {
    const scopes = "playlist-modify-public playlist-modify-private";
    res.redirect(
        `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(
            scopes
        )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
    );
});

app.post("/token", async (req, res) => {
    const { code } = req.body;

    try {
        const response = await axios.post(
            "https://accounts.spotify.com/api/token",
            new URLSearchParams({
                grant_type: "authorization_code",
                code: code,
                redirect_uri: REDIRECT_URI,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response.data });
    }
});

app.post("/create-playlist", async (req, res) => {
    const { token, userId, playlistName, trackUris } = req.body;

    try {
        const playlistResponse = await axios.post(
            `https://api.spotify.com/v1/users/${userId}/playlists`,
            { name: playlistName },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        const playlistId = playlistResponse.data.id;

        await axios.post(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            { uris: trackUris },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.response.data });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
