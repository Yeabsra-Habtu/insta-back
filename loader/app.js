const express = require("express");
const cors = require("cors");
require("dotenv").config();

const instagramRoutes = require("../routes/instagram.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("Server is healthy");
});

// Instagram API routes
app.use("/api/instagram", instagramRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

module.exports = app;
