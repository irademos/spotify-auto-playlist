const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;
const REDIRECT_URI = process.env.REACT_APP_VERCEL_ENV === "production"
    ? "https://spotify-auto-playlist.vercel.app/callback"
    : "http://localhost:3000/callback";

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


// // Add a new endpoint for searching playlists
// app.get("/search-playlists", async (req, res) => {
//     const query = req.query.q;
//     const token = req.headers.authorization.split(" ")[1];

//     try {
//         const response = await axios.get(`https://api.spotify.com/v1/me/playlists?limit=10&q=${query}`, {
//             headers: { Authorization: `Bearer ${token}` },
//         });
//         res.json(response.data);
//     } catch (error) {
//         res.status(500).json({ error: error.response.data });
//     }
// });


app.post("/search-playlists", async (req, res) => {
    const { token, query } = req.body;

    try {
        const response = await axios.get(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=10`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        res.json(response.data.playlists.items);
    } catch (error) {
        res.status(500).json({ error: error.response.data });
    }
});


// Update create-playlist endpoint
app.post("/create-playlist", async (req, res) => {
    const { token, playlists, timeframe, newPlaylistName } = req.body;

    try {
        // Fetch tracks from the selected playlists
        const tracks = [];
        for (const playlist of playlists) {
            const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const filteredTracks = response.data.items.filter((track) => {
                const addedDate = new Date(track.added_at);
                const now = new Date();

                if (timeframe === "daily") return now - addedDate <= 24 * 60 * 60 * 1000;
                if (timeframe === "weekly") return now - addedDate <= 7 * 24 * 60 * 60 * 1000;
                if (timeframe === "monthly") return now - addedDate <= 30 * 24 * 60 * 60 * 1000;

                return false;
            });

            tracks.push(...filteredTracks.map((track) => track.track.uri));
        }

        // Create a new playlist and add tracks
        const playlistResponse = await axios.post(
            `https://api.spotify.com/v1/me/playlists`,
            { name: newPlaylistName },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const playlistId = playlistResponse.data.id;

        await axios.post(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            { uris: tracks },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.response.data });
    }
});


// app.post("/create-playlist", async (req, res) => {
//     const { token, userId, playlistName, trackUris } = req.body;

//     try {
//         const playlistResponse = await axios.post(
//             `https://api.spotify.com/v1/users/${userId}/playlists`,
//             { name: playlistName },
//             {
//                 headers: { Authorization: `Bearer ${token}` },
//             }
//         );

//         const playlistId = playlistResponse.data.id;

//         await axios.post(
//             `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
//             { uris: trackUris },
//             {
//                 headers: { Authorization: `Bearer ${token}` },
//             }
//         );

//         res.json({ success: true });
//     } catch (error) {
//         res.status(500).json({ error: error.response.data });
//     }
// });

app.listen(PORT, () => {
    console.log(`Server running on :${PORT}`);
});
