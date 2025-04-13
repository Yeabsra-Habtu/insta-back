const express = require("express");
const router = express.Router();
const instagramController = require("../controllers/instagram.controller");

// Authentication routes
router.get("/login", instagramController.login);
router.get("/callback", instagramController.handleCallback);
router.post("/logout", instagramController.logout);

// Data fetching routes
router.get("/profile", instagramController.getProfile);
router.get("/media", instagramController.getMedia);

// Interaction routes
router.post("/media/:mediaId/comments", instagramController.createComment);
router.get("/media/:mediaId/comments", instagramController.getMediaComments);
router.post(
  "/media/:mediaId/comments/reply",
  instagramController.replyToComment
);

module.exports = router;
