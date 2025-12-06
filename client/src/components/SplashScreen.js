import React from "react";
import "./SplashScreen.css";
import { useHistory } from "react-router-dom";

export default function SplashScreen() {
  const history = useHistory();

  const handleContinueAsGuest = () => history.push("/playlists");
  const handleLogin = () => history.push("/login/");
  const handleCreate = () => history.push("/register/");

  return (
    <div id="splash-wrapper">
      <div id="splash-card">
        <div id="splash-title">The Playlister</div>

        <div id="splash-icon">♪</div>

        <div id="splash-buttons">
          <button className="splash-btn" onClick={() => history.push("/home")}>
            Continue as Guest
          </button>
          <button className="splash-btn" onClick={() => history.push("/login")}>
            Login
          </button>
          <button className="splash-btn" onClick={() => history.push("/register")}>
            Create Account
          </button>
          <button onClick={handleContinueAsGuest}>
            Continue as Guest
            </button>
          <button onClick={handleLogin}>
            Login
            </button>
          <button onClick={handleCreate}>
            Create Account
            </button>
        </div>
      </div>
    </div>
  );
}
