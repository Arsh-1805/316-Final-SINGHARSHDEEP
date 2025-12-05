import { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import AuthContext from "../auth";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

export default function EditAccountScreen() {
  const { auth } = useContext(AuthContext);
  const history = useHistory();

  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVerify, setPasswordVerify] = useState("");
  const [avatarData, setAvatarData] = useState("");
  const [avatarError, setAvatarError] = useState("");

  const [touched, setTouched] = useState({
    email: false,
    userName: false,
    password: false,
    passwordVerify: false,
  });   
  
  useEffect(() => {
    if (auth.user) {
      setEmail(auth.user.email || "");
      setUserName(auth.user.userName || "");
      setAvatarData(auth.user.avatar || "");
    }
  }, [auth.user]);

  const emailError =
    touched.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
      ? "Enter a valid email address."
      : "";

  const userNameError =
    touched.userName && userName.trim().length === 0
      ? "User name cannot be empty or whitespace."
      : "";

  const passwordError =
    touched.password && password.length > 0 && password.length < 8
      ? "Password must be at least 8 characters."
      : "";

  const passwordVerifyError =
    touched.passwordVerify &&
    passwordVerify !== password &&
    (password.length > 0 || passwordVerify.length > 0)
      ? "Passwords do not match."
      : "";

  const isFormValid =
    email &&
    userName.trim().length > 0 &&
    !emailError &&
    !userNameError &&
    !passwordError &&
    !passwordVerifyError &&
    !avatarError;

  const markTouched = (field) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file.");
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const { width, height } = img;
      URL.revokeObjectURL(objectUrl);

      if (width !== 128 || height !== 128) {
        setAvatarError("Avatar must be exactly 128 x 128 pixels.");
        setAvatarData("");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarError("");
        setAvatarData(reader.result);
      };
      reader.readAsDataURL(file);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setAvatarError("Could not read image.");
      setAvatarData("");
    };

    img.src = objectUrl;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    // only send password if they typed one
    const newPassword = password.length > 0 ? password : null;
    const newPasswordVerify =
      passwordVerify.length > 0 ? passwordVerify : null;

    auth.updateUser(
      email,
      userName,
      newPassword,
      newPasswordVerify,
      avatarData
    );
  };

  const handleCancel = () => {
    history.push("/");
  };