import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req, res) {
    const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
    const REDIRECT_URI = process.env.REACT_APP_VERCEL_ENV === "production"
        ? "https://spotify-auto-playlist.vercel.app/callback"
        : "http://localhost:3000/callback";
    
    const scopes = "playlist-modify-public playlist-modify-private";
    res.redirect(
        `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(
            scopes
        )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
    );
}
