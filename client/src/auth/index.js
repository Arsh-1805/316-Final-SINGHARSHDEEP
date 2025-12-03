import React, { createContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import authRequestSender from "./requests";

const AuthContext = createContext();

export const AuthActionType = {
  GET_LOGGED_IN: "GET_LOGGED_IN",
  LOGIN_USER: "LOGIN_USER",
  LOGOUT_USER: "LOGOUT_USER",
  REGISTER_USER: "REGISTER_USER",
};

function AuthContextProvider(props) {
  const [auth, setAuth] = useState({
    user: null,
    loggedIn: false,
    errorMessage: null,
  });
  const history = useHistory();

  useEffect(() => {
    auth.getLoggedIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const authReducer = (action) => {
    const { type, payload } = action;
    switch (type) {
      case AuthActionType.GET_LOGGED_IN: {
        return setAuth({
          user: payload.user,
          loggedIn: payload.loggedIn,
          errorMessage: null,
        });
      }
      case AuthActionType.LOGIN_USER: {
        return setAuth({
          user: payload.user,
          loggedIn: payload.loggedIn,
          errorMessage: payload.errorMessage,
        });
      }
      case AuthActionType.LOGOUT_USER: {
        return setAuth({
          user: null,
          loggedIn: false,
          errorMessage: null,
        });
      }
      case AuthActionType.REGISTER_USER: {
        return setAuth({
          user: payload.user,
          loggedIn: payload.loggedIn,
          errorMessage: payload.errorMessage,
        });
      }
      default:
        return auth;
    }
  };

  // GET LOGGED IN
  auth.getLoggedIn = async function () {
    const response = await authRequestSender.getLoggedIn();
    if (response.status === 200) {
      authReducer({
        type: AuthActionType.GET_LOGGED_IN,
        payload: {
          loggedIn: response.data.loggedIn,
          user: response.data.user,
        },
      });
    }
  };

  // REGISTER – create account but DO NOT log in (Use-Case 2.1)
  auth.registerUser = async function (
    firstName,
    lastName,
    email,
    password,
    passwordVerify
  ) {
    try {
      const response = await authRequestSender.registerUser(
        firstName,
        lastName,
        email,
        password,
        passwordVerify
      );

      if (response.status === 200) {
        // account created, but loggedIn stays false
        authReducer({
          type: AuthActionType.REGISTER_USER,
          payload: {
            user: null,
            loggedIn: false,
            errorMessage: null,
          },
        });
        // send them to Login screen so they can log in manually
        history.push("/login");
      } else {
        authReducer({
          type: AuthActionType.REGISTER_USER,
          payload: {
            user: auth.user,
            loggedIn: false,
            errorMessage:
              response.data.errorMessage || "Register failed.",
          },
        });
      }
    } catch (err) {
      authReducer({
        type: AuthActionType.REGISTER_USER,
        payload: {
          user: auth.user,
          loggedIn: false,
          errorMessage: "Register failed.",
        },
      });
    }
  };

  // LOGIN
  auth.loginUser = async function (email, password) {
    try {
      const response = await authRequestSender.loginUser(email, password);

      if (response.status === 200) {
        authReducer({
          type: AuthActionType.LOGIN_USER,
          payload: {
            user: response.data.user,
            loggedIn: true,
            errorMessage: null,
          },
        });
        history.push("/");
      } else {
        authReducer({
          type: AuthActionType.LOGIN_USER,
          payload: {
            user: auth.user,
            loggedIn: false,
            errorMessage: response.data.errorMessage || "Login failed.",
          },
        });
      }
    } catch (err) {
      authReducer({
        type: AuthActionType.LOGIN_USER,
        payload: {
          user: auth.user,
          loggedIn: false,
          errorMessage: "Login failed.",
        },
      });
    }
  };

  // LOGOUT
  auth.logoutUser = async function () {
    try {
      const response = await authRequestSender.logoutUser();
      if (response.status !== 200) {
        console.error("Logout server error:", response.status);
      }
    } catch (err) {
      console.error("Logout request failed (forcing client logout):", err);
    } finally {
      // Always clear auth locally
      authReducer({
        type: AuthActionType.LOGOUT_USER,
        payload: null,
      });
      history.push("/login"); // or "/" depending on your flow
    }
  };

  auth.getUserInitials = function () {
    let initials = "";
    if (auth.user) {
      initials += auth.user.firstName.charAt(0);
      initials += auth.user.lastName.charAt(0);
    }
    return initials;
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
export { AuthContextProvider };
