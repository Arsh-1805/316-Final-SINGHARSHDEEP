import React, { createContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import authRequestSender from "./requests";

const AuthContext = createContext();

export const AuthActionType = {
  GET_LOGGED_IN: "GET_LOGGED_IN",
  LOGIN_USER: "LOGIN_USER",
  LOGOUT_USER: "LOGOUT_USER",
  REGISTER_USER: "REGISTER_USER",
  UPDATE_USER: "UPDATE_USER",
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
          case AuthActionType.UPDATE_USER: {
      return setAuth({
        user: payload.user,
        loggedIn: true,
        errorMessage: payload.errorMessage,
      });
    }
      default:
        return auth;
    }
  };

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

auth.registerUser = async function (
  email,
  userName,
  password,
  passwordVerify,
  avatar
) {
  try {
    const response = await authRequestSender.registerUser(
      email,
      userName,
      password,
      passwordVerify,
      avatar
    );

    if (response.status === 200) {
      authReducer({
        type: AuthActionType.REGISTER_USER,
        payload: {
          user: null,
          loggedIn: false,
          errorMessage: null,
        },
      });
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

  auth.logoutUser = async function () {
    try {
      const response = await authRequestSender.logoutUser();
      if (response.status !== 200) {
        console.error("Logout server error:", response.status);
      }
    } catch (err) {
      console.error("Logout request failed (forcing client logout):", err);
    } finally {
      authReducer({
        type: AuthActionType.LOGOUT_USER,
        payload: null,
      });
      history.push("/login"); 
    }
  };

auth.getUserInitials = function () {
  if (!auth.user) return "";

  if (auth.user.userName && auth.user.userName.length > 0) {
    return auth.user.userName.charAt(0).toUpperCase();
  }

  return "";
};

  auth.updateUser = async function (
    email,
    userName,
    password,
    passwordVerify,
    avatar
  ) {
    try {
      const response = await authRequestSender.updateUser(
        email,
        userName,
        password,
        passwordVerify,
        avatar
      );

      if (response.status === 200) {
        authReducer({
          type: AuthActionType.UPDATE_USER,
          payload: {
            user: response.data.user,
            loggedIn: true,
            errorMessage: null,
          },
        });
        history.push("/");   // go back to playlists/home
      } else {
        authReducer({
          type: AuthActionType.UPDATE_USER,
          payload: {
            user: auth.user,
            loggedIn: true,
            errorMessage:
              response.data.error || "Failed to update account.",
          },
        });
      }
    } catch (err) {
      authReducer({
        type: AuthActionType.UPDATE_USER,
        payload: {
          user: auth.user,
          loggedIn: true,
          errorMessage: "Failed to update account.",
        },
      });
    }
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
