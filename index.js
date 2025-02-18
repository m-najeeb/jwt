require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.json());

let refreshTokens = []; // Store refresh tokens (in-memory for simplicity)

app.get("/", (req, res) => {
  res.json({ msg: "Sample API" });
});

app.post("/login", (req, res) => {
  const user = req.body;

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign({ user }, process.env.REFRESH_SECRET_KEY);
  refreshTokens.push(refreshToken);

  res.json({
    accessToken,
    refreshToken,
  });
});

app.post("/token", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ result: "Refresh token is not valid." });
  }

  jwt.verify(
    refreshToken,
    process.env.REFRESH_SECRET_KEY,
    (error, authData) => {
      if (error) {
        return res.status(403).json({ result: "Invalid refresh token." });
      }
      const accessToken = generateAccessToken(authData.user);
      res.json({ accessToken });
    }
  );
});

app.post("/logout", (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.json({ result: "User logged out successfully." });
});

app.post("/profile", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (error, authData) => {
    if (error) {
      return res.status(403).json({ result: "Invalid token." });
    }
    res.json({ msg: "Profile accessed", authData });
  });
});

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    req.token = token;
    next();
  } else {
    res.status(403).json({ result: "Token is not valid." });
  }
}

function generateAccessToken(user) {
  return jwt.sign({ user }, process.env.SECRET_KEY, { expiresIn: "300s" });
}

app.listen(3000, () => console.log("Server running on port 3000"));
