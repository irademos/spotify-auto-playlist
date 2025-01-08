import React, { useState } from "react";
import axios from "axios";

const App = () => {
    const [authToken, setAuthToken] = useState("");
    const [userId, setUserId] = useState("");
    const [playlistName, setPlaylistName] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedPlaylists, setSelectedPlaylists] = useState([]);
    const [frequency, setFrequency] = useState("");

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

    const searchPlaylists = async (query) => {
        if (!query) {
            setSearchResults([]);
            return;
        }
    
        try {
            const response = await axios.post("http://localhost:5000/search-playlists", {
                token: authToken,
                query: query,
            });
    
            console.log("Search Results:", response.data); // Debugging line
            setSearchResults(response.data);
        } catch (error) {
            console.error("Error searching playlists:", error);
            setSearchResults([]);
        }
    };
    

    const addPlaylist = (playlist) => {
        setSelectedPlaylists((prev) => [...prev, playlist]);
        setSearchResults([]);
        setPlaylistName(""); // Clear the input box
    };

    const createPlaylist = async () => {
        if (!frequency || selectedPlaylists.length === 0) {
            alert("Please select frequency and playlists.");
            return;
        }

        // Your logic to fetch tracks and create the playlist based on the selected playlists and frequency
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
                    <div>
                        <input
                            type="text"
                            placeholder="Search Playlists"
                            value={playlistName}
                            onChange={(e) => {
                                setPlaylistName(e.target.value);
                                searchPlaylists(e.target.value);
                            }}
                        />
                        <ul>
                            {searchResults.length === 0 && <p>No playlists found.</p>}
                            {searchResults.map((playlist) => (
                                playlist && playlist.name ? (
                                    <li
                                        key={playlist.id}
                                        onClick={() => addPlaylist(playlist)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        {playlist.name}
                                    </li>
                                ) : null
                            ))}
                        </ul>

                    </div>

                    <h3>Selected Playlists:</h3>
                    <ul>
                        {selectedPlaylists.map((playlist) => (
                            <li key={playlist.id}>{playlist.name}</li>
                        ))}
                    </ul>

                    <h3>Frequency:</h3>
                    <label>
                        <input
                            type="radio"
                            value="daily"
                            checked={frequency === "daily"}
                            onChange={() => setFrequency("daily")}
                        />
                        Daily
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="weekly"
                            checked={frequency === "weekly"}
                            onChange={() => setFrequency("weekly")}
                        />
                        Weekly
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="monthly"
                            checked={frequency === "monthly"}
                            onChange={() => setFrequency("monthly")}
                        />
                        Monthly
                    </label>

                    <button onClick={createPlaylist}>Create Playlist</button>
                </div>
            )}
        </div>
    );
};

export default App;
