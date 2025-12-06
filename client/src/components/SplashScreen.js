import React, { useContext } from "react";
import "./SplashScreen.css";
import { useHistory } from "react-router-dom";
import AuthContext from "../auth";

export default function SplashScreen() {
  const history = useHistory();
  const { auth } = useContext(AuthContext);

  const handleContinueAsGuest = () => {
    if (auth.setGuestUser) {
      auth.setGuestUser();
    } else {
      history.push("/playlists");
    }
  };
  const handleLogin = () => history.push("/login/");
  const handleCreate = () => history.push("/register/");

  return (
    <div id="splash-wrapper">
      <div id="splash-card">
        <div id="splash-title">The Playlister</div>

        <div id="splash-icon">♪</div>

        <div id="splash-buttons">
          <button className="splash-btn" onClick={handleContinueAsGuest}>
            Continue as Guest
          </button>
          <button className="splash-btn" onClick={() => history.push("/login")}>
            Login
          </button>
          <button className="splash-btn" onClick={() => history.push("/register")}>
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
