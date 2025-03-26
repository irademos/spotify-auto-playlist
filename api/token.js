import axios from 'axios';

export default async function handler(req, res) {
    const { code } = req.body;

    const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
    const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;
    const REDIRECT_URI = process.env.REACT_APP_VERCEL_ENV === "production"
        ? "https://spotify-auto-playlist.vercel.app/callback"
        : "http://localhost:3000/callback";
    
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
}
