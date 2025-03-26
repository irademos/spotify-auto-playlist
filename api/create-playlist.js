import axios from 'axios';

export default async function handler(req, res) {
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
}
