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
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Avatar Image (128 × 128 pixels)
                  </Typography>
                  <Button variant="contained" component="label">
                    Choose Avatar
                    <input
                      type="file"
                      hidden
                      accept="image/*"
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
                  Save
                </Button>
                <Button
                  variant="outlined"
                  sx={{ px: 4 }}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}