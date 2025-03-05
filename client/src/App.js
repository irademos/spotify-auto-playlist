import React, { useState } from "react";
import axios from "axios";

const App = () => {
    const [authToken, setAuthToken] = useState("");
    const [userId, setUserId] = useState("");
    const [playlistName, setPlaylistName] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedPlaylists, setSelectedPlaylists] = useState([]);
    const [frequency, setFrequency] = useState("");
    const [newPlaylistName, setNewPlaylistName] = useState(""); // State for new playlist name

    const login = () => {
        window.location.href = process.env.CUSTOM_VERCEL === "production"
        ? "https://spotify-auto-playlist.vercel.app/login"
        : "http://localhost:5000/login";
    };

    // const getToken = async (code) => {
    //     const response = await axios.post(process.env.NODE_ENV === "production"
    //         ? "https://spotify-auto-playlist.vercel.app/token"
    //         : "http://localhost:5000/token", { code });
    //     setAuthToken(response.data.access_token);

    //     const userResponse = await axios.get("https://api.spotify.com/v1/me", {
    //         headers: { Authorization: `Bearer ${response.data.access_token}` },
    //     });

    //     setUserId(userResponse.data.id);
    // };


    const getToken = async (code) => {
        console.log("Attempting to fetch token with code:", code); // Debugging
        try {
            const response = await axios.post(process.env.CUSTOM_VERCEL === "production"
                ? "https://spotify-auto-playlist.vercel.app/token"
                : "http://localhost:5000/token", { code });
    
            console.log("Token response:", response.data); // Debugging
            setAuthToken(response.data.access_token);
    
            const userResponse = await axios.get("https://api.spotify.com/v1/me", {
                headers: { Authorization: `Bearer ${response.data.access_token}` },
            });
    
            console.log("User response:", userResponse.data); // Debugging
            setUserId(userResponse.data.id);
        } catch (error) {
            console.error("Error fetching token or user details:", error);
        }
    };
    

    const searchPlaylists = async (query) => {
        if (!query) {
            setSearchResults([]);
            return;
        }
    
        try {
            const response = await axios.post(process.env.CUSTOM_VERCEL === "production"
                ? "https://spotify-auto-playlist.vercel.app/search-playlists"
                : "http://localhost:5000/search-playlists", {
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

        try {
            const response = await axios.post(process.env.CUSTOM_VERCEL === "production"
                ? "https://spotify-auto-playlist.vercel.app/create-playlist"
                : "http://localhost:5000/create-playlist", {
                token: authToken,
                playlists: selectedPlaylists,
                timeframe: frequency,
                newPlaylistName: newPlaylistName, // Send new playlist name to the backend
            });

            if (response.data.success) {
                alert("Playlist created successfully!");
            } else {
                alert("Failed to create playlist.");
            }
        } catch (error) {
            console.error("Error creating playlist:", error);
            alert("Error creating playlist.");
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
                    {userId && <p>Logged in as: {userId}</p>}
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

                    <h3>New Playlist Name:</h3>
                    <input
                        type="text"
                        placeholder="Enter new playlist name"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                    />

                    <button onClick={createPlaylist}>Create Playlist</button>
                </div>
            )}
        </div>
    );
};

export default App;
