import axios from "axios";

export default async function handler(req, res) {
    const { code } = req.query; // Get the authorization code from the query string

    const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
    const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;
    const REDIRECT_URI = process.env.REACT_APP_VERCEL_ENV === "production"
        ? "https://spotify-auto-playlist.vercel.app/callback"
        : "http://localhost:3000/callback";

    try {
        // Exchange the authorization code for an access token
        const response = await axios.post(
            "https://accounts.spotify.com/api/token",
            new URLSearchParams({
                grant_type: "authorization_code",
                code,
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

        // Save the token (you can also store it in a session or database if necessary)
        const { access_token, refresh_token } = response.data;

        // Redirect the user or respond with the token
        res.redirect(`/success?access_token=${access_token}&refresh_token=${refresh_token}`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to exchange authorization code" });
    }
}
