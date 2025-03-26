// /api/login.js
// export default function handler(req, res) {
//     const scopes = "playlist-modify-public playlist-modify-private";
//     console.log(process.env.REACT_APP_CLIENT_ID);
//     res.redirect(
//         `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(
//             scopes
//         )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
//     );
// }


export default function handler(req, res) {
    const CLIENT_ID = process.env.REACT_APP_CLIENT_ID; // Make sure this is set in Vercel
    const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI; // Must be defined in Vercel as well

    if (!CLIENT_ID || !REDIRECT_URI) {
        console.error("Missing environment variables:", { CLIENT_ID, REDIRECT_URI });
        return res.status(500).json({ error: "Missing Spotify credentials" });
    }

    const scopes = "playlist-modify-public playlist-modify-private";
    
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(
        scopes
    )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

    console.log("Redirecting to:", authUrl); // Debugging

    res.redirect(authUrl);
}
