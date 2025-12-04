import React from "react";
import { useHistory } from "react-router-dom";
import "./SplashScreen.css";

export default function SplashScreen() {
  const history = useHistory();

  return (
    <div id="splash-screen-container">
      <div className="welcome-card">
        <h1 className="welcome-title">The Playlister</h1>

        <div className="welcome-buttons">
          <button onClick={() => history.push("/playlists")}>
            Continue as Guest
          </button>

          <button onClick={() => history.push("/login")}>
            Login
          </button>

          <button onClick={() => history.push("/register")}>
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
