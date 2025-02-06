require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();

app.get("/", (req, res) => {
  res.json({
    msg: "Sample API",
  });
});

app.post("/login", (req, res) => {
  const user = {
    id: 1,
    username: "John",
    email: "john@email.com",
  };
  jwt.sign(
    { user },
    process.env.SECRET_KEY,
    { expiresIn: "300s" },
    (error, token) => {
      res.json({
        token,
      });
    }
  );
});

app.post("/profile", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, (error, authData) => {
    if (error) {
      res.send({ result: "Invalid token" });
    }
    res.json({
      msg: "Profile accessed",
      authData,
    });
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
    res.send({
      result: "Token is not valid.",
    });
  }
}

app.listen(3000);
