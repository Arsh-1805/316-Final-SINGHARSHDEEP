import { useContext, useEffect, useRef, useState } from "react";
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
  const avatarErrorTimerRef = useRef(null);

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

  useEffect(() => {
    return () => {
      if (avatarErrorTimerRef.current) {
        clearTimeout(avatarErrorTimerRef.current);
      }
    };
  }, []);

  const isFormValid =
    email &&
    userName.trim().length > 0 &&
    !emailError &&
    !userNameError &&
    !passwordError &&
    !passwordVerifyError &&
    avatarData !== null;

  const showAvatarError = (message) => {
    if (avatarErrorTimerRef.current) {
      clearTimeout(avatarErrorTimerRef.current);
    }
    setAvatarError(message);
    avatarErrorTimerRef.current = setTimeout(() => {
      setAvatarError("");
      avatarErrorTimerRef.current = null;
    }, 4000);
  };

  const markTouched = (field) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "image/png") {
      showAvatarError("Avatar must be a 250 x 250 PNG file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      const img = new Image();
      img.onload = () => {
        if (img.width !== 250 || img.height !== 250) {
          showAvatarError("Avatar must be exactly 250 x 250 pixels.");
        } else {
          if (avatarErrorTimerRef.current) {
            clearTimeout(avatarErrorTimerRef.current);
            avatarErrorTimerRef.current = null;
          }
          setAvatarError("");
          setAvatarData(dataUrl);
        }
      };
      img.onerror = () => {
        showAvatarError("Unable to read image. Please try another file.");
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#ffe4ff" }}>
      <CssBaseline />
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            mt: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              width: "100%",
              bgcolor: "#fffbe6",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Edit Account
              </Typography>
            </Box>

            <Box component="form" noValidate onSubmit={handleSubmit}>
              <Grid container spacing={2} alignItems="center">
                <Grid
                  item
                  xs={12}
                  sm={3}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <Avatar
                    src={avatarData || ""}
                    alt="Avatar preview"
                    sx={{ width: 72, height: 72 }}
                  />
                </Grid>

                <Grid item xs={12} sm={9}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        id="userName"
                        label="User Name"
                        name="userName"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onBlur={markTouched("userName")}
                        error={Boolean(userNameError)}
                        helperText={userNameError}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={markTouched("email")}
                        error={Boolean(emailError)}
                        helperText={emailError}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="password"
                        label="New Password (optional)"
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={markTouched("password")}
                        error={Boolean(passwordError)}
                        helperText={passwordError}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="passwordVerify"
                        label="Confirm New Password"
                        type="password"
                        id="passwordVerify"
                        value={passwordVerify}
                        onChange={(e) => setPasswordVerify(e.target.value)}
                        onBlur={markTouched("passwordVerify")}
                        error={Boolean(passwordVerifyError)}
                        helperText={passwordVerifyError}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Avatar Image (250 × 250 PNG)
                  </Typography>
                  <Button variant="contained" component="label">
                    CHOOSE AVATAR
                    <input
                      type="file"
                      hidden
                      accept="image/png"
                      onChange={handleAvatarChange}
                    />
                  </Button>
                  {avatarData && !avatarError && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Image selected ✔
                    </Typography>
                  )}
                  {avatarError && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      {avatarError}
                    </Typography>
                  )}
                </Grid>
              </Grid>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 3,
                  gap: 2,
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    px: 4,
                    bgcolor: "#333",
                    "&:hover": { bgcolor: "#000" },
                  }}
                  disabled={!isFormValid}
                >
                  SAVE
                </Button>
                <Button
                  variant="outlined"
                  sx={{ px: 4 }}
                  onClick={handleCancel}
                >
                  CANCEL
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
