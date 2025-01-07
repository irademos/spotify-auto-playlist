import React, { useState } from "react";
import axios from "axios";

const App = () => {
    const [authToken, setAuthToken] = useState("");
    const [userId, setUserId] = useState("");
    const [playlistName, setPlaylistName] = useState("");
    const [trackUris, setTrackUris] = useState("");

    const login = () => {
        window.location.href = "http://localhost:5000/login";
    };

    const getToken = async (code) => {
        const response = await axios.post("http://localhost:5000/token", { code });
        setAuthToken(response.data.access_token);

        const userResponse = await axios.get("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${response.data.access_token}` },
        });

        setUserId(userResponse.data.id);
    };

    const createPlaylist = async () => {
        const response = await axios.post("http://localhost:5000/create-playlist", {
            token: authToken,
            userId: userId,
            playlistName: playlistName,
            trackUris: trackUris.split(","),
        });

        if (response.data.success) {
            alert("Playlist created!");
        }
    };

    React.useEffect(() => {
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
            getToken(code);
        }
    }, []);

    return (
        <div>
            <h1>Spotify Playlist Creator</h1>
            {!authToken ? (
                <button onClick={login}>Login with Spotify</button>
            ) : (
                <div>
                    <input
                        type="text"
                        placeholder="Playlist Name"
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Track URIs (comma-separated)"
                        value={trackUris}
                        onChange={(e) => setTrackUris(e.target.value)}
                    />
                    <button onClick={createPlaylist}>Create Playlist</button>
                </div>
            )}
        </div>
    );
};

export default App;
