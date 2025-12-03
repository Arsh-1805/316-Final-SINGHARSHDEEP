const bcrypt = require("bcryptjs");
const User = require("../models/user-model");
const { signToken, verifyToken } = require("../auth");

async function registerUser(req, res) {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: "Email already used" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      passwordHash,
    });
    await user.save();

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error("registerUser error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ success: false, error: "Invalid password" });
    }

    const token = signToken({ id: user._id, email: user.email });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,        
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, 
    });

    console.log("User logged in:", user.email);

    return res.status(200).json({
      success: true,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error("loginUser error:", err);
    return res.status(500).json({ success: false, error: "Server error while logging in" });
  }
}

async function getLoggedIn(req, res) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json({ loggedIn: false });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.json({ loggedIn: false });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return res.json({ loggedIn: false });
    }

    return res.json({
      loggedIn: true,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error("getLoggedIn error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

async function logoutUser(req, res) {
  res.clearCookie("token");
  return res.status(200).json({ success: true });
}

const logoutUser = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0) // expire immediately
  });
  return res.status(200).json({ message: "Logged out" });
};

module.exports = {
  registerUser,
  loginUser,
  getLoggedIn,
  logoutUser,
};
