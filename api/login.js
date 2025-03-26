// /api/login.js
export default async function handler(req, res) {
    const scopes = "playlist-modify-public playlist-modify-private";
    console.log(process.env.REACT_APP_CLIENT_ID);
    res.redirect(
        `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(
            scopes
        )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
    );
}