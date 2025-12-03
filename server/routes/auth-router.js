const express = require("express");
const {
  registerUser,
  loginUser,
  getLoggedIn,
  logoutUser,
} = require("../controllers/auth-controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/loggedIn", getLoggedIn);
router.post("/logout", logoutUser);

module.exports = router;
