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
      console.log("Req body", req.body);
      console.log("Req query", req.query);
      console.log("Req params", req.params);
      console.log("Req headers", req.headers);
      const tokenData = await instagramService.exchangeCodeForToken(code);

      // Redirect to frontend with token
      res.redirect(
        `${process.env.FRONTEND_URL}?token=${tokenData.access_token}`
      );
    } catch (error) {
      console.error("Callback error:", error);

      // Determine appropriate status code based on error type
      let statusCode = 500;
      if (error.message.includes("Missing required Instagram configuration")) {
        statusCode = 400;
      } else if (error.message.includes("Invalid response format")) {
        statusCode = 502;
      }

      // Redirect to frontend with error
      const errorMessage = encodeURIComponent(error.message);
      res.redirect(`${process.env.FRONTEND_URL}?error=${errorMessage}`);
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

  async getMediaComments(req, res) {
    try {
      const { mediaId } = req.params;
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ error: "Access token is required" });
      }

      const comments = await instagramService.getMediaComments(mediaId, token);
      console.log("Comments", comments);
      res.json(comments);
    } catch (error) {
      console.error("Comments fetch error:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
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
