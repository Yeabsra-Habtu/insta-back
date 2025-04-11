const instagramService = require("../services/instagram.service");

class InstagramController {
  async login(req, res) {
    try {
      const authUrl = instagramService.getAuthUrl();
      console.log("auth url", authUrl);
      res.redirect(authUrl);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to initiate Instagram login" });
    }
  }

  async handleCallback(req, res) {
    try {
      const { code } = req.query;
      if (!code) {
        return res
          .status(400)
          .json({ error: "Authorization code is required" });
      }

      const tokenData = await instagramService.exchangeCodeForToken(code);

      // Redirect to frontend with token
      res.redirect(
        `${process.env.FRONTEND_URL}?token=${tokenData.access_token}`
      );
    } catch (error) {
      console.error("Callback error:", error);
      res.status(500).json({ error: "Failed to exchange code for token" });
    }
  }

  async getProfile(req, res) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Access token is required" });
      }

      const profile = await instagramService.getUserProfile(token);
      res.json(profile);
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  }

  async getMedia(req, res) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Access token is required" });
      }

      const media = await instagramService.getUserMedia(token);
      res.json(media);
    } catch (error) {
      console.error("Media fetch error:", error);
      res.status(500).json({ error: "Failed to fetch media" });
    }
  }

  async replyToComment(req, res) {
    try {
      const { mediaId } = req.params;
      const { commentId, message } = req.body;
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ error: "Access token is required" });
      }
      if (!commentId || !message) {
        return res
          .status(400)
          .json({ error: "Comment ID and message are required" });
      }

      const reply = await instagramService.replyToComment(
        mediaId,
        commentId,
        message,
        token
      );
      res.json(reply);
    } catch (error) {
      console.error("Comment reply error:", error);
      res.status(500).json({ error: "Failed to reply to comment" });
    }
  }
}

module.exports = new InstagramController();
