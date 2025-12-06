const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

function verifyToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function verifyUser(req) {
  if (!req || !req.cookies) return null;
  const payload = verifyToken(req.cookies.token);
  if (!payload) return null;
  return payload.id || payload.userId || null;
}

module.exports = { signToken, verifyToken, verifyUser };
