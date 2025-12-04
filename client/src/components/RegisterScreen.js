import { useContext, useState } from "react";
import AuthContext from "../auth";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

export default function RegisterScreen() {
  const { auth } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVerify, setPasswordVerify] = useState("");
  const [avatarData, setAvatarData] = useState(""); // base64 string
  const [avatarError, setAvatarError] = useState("");

  const [touched, setTouched] = useState({
    email: false,
    userName: false,
    password: false,
    passwordVerify: false,
  });

  // === client-side validation ===
  const emailError =
    touched.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
      ? "Enter a valid email address."
      : "";

  const userNameError =
    touched.userName && userName.trim().length === 0
      ? "User name cannot be empty or whitespace."
      : "";

  const passwordError =
    touched.password && password.length < 8
      ? "Password must be at least 8 characters."
      : "";

  const passwordVerifyError =
    touched.passwordVerify && passwordVerify !== password
      ? "Passwords do not match."
      : "";

  const isFormValid =
    email &&
    userName.trim().length > 0 &&
    password.length >= 8 &&
    passwordVerify === password &&
    avatarData &&
    !emailError &&
    !userNameError &&
    !passwordError &&
    !passwordVerifyError &&
    !avatarError;

  const markTouched = (field) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  // === avatar (image -> base64 string) ===
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file.");
      setAvatarData("");
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const { width, height } = img;
      URL.revokeObjectURL(objectUrl);

      // example fixed size; matches spec requirement for prescribed size
      if (width !== 128 || height !== 128) {
        setAvatarError("Avatar must be exactly 128 x 128 pixels.");
        setAvatarData("");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarError("");
        setAvatarData(reader.result); // base64 data URL
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

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isFormValid) return;

    auth.registerUser(email, userName, password, passwordVerify, avatarData);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#ffe4ff" }}>
      <Container component="main" maxWidth="sm">
        <CssBaseline />
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
              bgcolor: "#fffbe6", // light yellow inner panel
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
                Create Account
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
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={markTouched("email")}
                    error={Boolean(emailError)}
                    helperText={emailError || auth.errorMessage || ""}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={markTouched("password")}
                    error={Boolean(passwordError)}
                    helperText={
                      passwordError || "Password must be at least 8 characters."
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="passwordVerify"
                    label="Password Confirm"
                    type="password"
                    id="passwordVerify"
                    autoComplete="new-password"
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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={!isFormValid}
              >
                Create Account
              </Button>

              <Grid container justifyContent="center">
                <Grid item>
                  <Typography variant="body2" sx={{ color: "red" }}>
                    Already have an account?{" "}
                    <Link href="/login/" underline="hover">
                      Sign In
                    </Link>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
