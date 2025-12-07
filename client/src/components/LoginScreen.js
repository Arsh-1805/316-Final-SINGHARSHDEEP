import { useContext } from "react";
import AuthContext from "../auth";
import MUIErrorModal from "./MUIErrorModal";
import Copyright from "./Copyright";

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

export default function LoginScreen() {
  const { auth } = useContext(AuthContext);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    auth.loginUser(formData.get("email"), formData.get("password"));
  };

  let modalJSX = "";
  if (auth.errorMessage !== null) {
    modalJSX = <MUIErrorModal />;
  }

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
                Sign In
              </Typography>
            </Box>

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, bgcolor: "#333", "&:hover": { bgcolor: "#000" } }}
              >
                Sign In
              </Button>

              <Grid container justifyContent="center">
                <Grid item>
                  <Link href="/register/" variant="body2">
                    {"Don't have an account? Create Account"}
                  </Link>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Copyright />
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
      {modalJSX}
    </Box>
  );
}
