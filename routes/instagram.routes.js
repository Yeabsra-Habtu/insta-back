const express = require("express");
const router = express.Router();
const instagramController = require("../controllers/instagram.controller");

// Authentication routes
router.get("/login", instagramController.login);
router.get("/callback", instagramController.handleCallback);

// Data fetching routes
router.get("/profile", instagramController.getProfile);
router.get("/media", instagramController.getMedia);

// Interaction routes
router.post("/comment/:mediaId/reply", instagramController.replyToComment);

module.exports = router;
