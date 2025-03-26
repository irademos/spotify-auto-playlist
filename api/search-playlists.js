import axios from 'axios';

export default async function handler(req, res) {
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
}
