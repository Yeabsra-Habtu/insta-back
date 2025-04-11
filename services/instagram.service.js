const axios = require("axios");
const instagramConfig = require("../config/instagram.config");

class InstagramService {
  constructor() {
    this.config = instagramConfig;
  }

  getAuthUrl() {
    const queryParams = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(","),
      response_type: "code",
    });

    return `${this.config.authUrl}?${queryParams.toString()}`;
  }

  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post(this.config.tokenUrl, {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: "authorization_code",
        redirect_uri: this.config.redirectUri,
        code,
      });
      console.log("Response data:", response.data); // Add this line to log the response data

      return response.data;
    } catch (error) {
      console.error(
        "Error exchanging code for token:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async getUserProfile(accessToken) {
    try {
      const response = await axios.get(`${this.config.graphApiUrl}/me`, {
        params: {
          fields: "id,username,account_type,media_count",
          access_token: accessToken,
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        "Error fetching user profile:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async getUserMedia(accessToken) {
    try {
      const response = await axios.get(`${this.config.graphApiUrl}/me/media`, {
        params: {
          fields:
            "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
          access_token: accessToken,
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        "Error fetching user media:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async replyToComment(mediaId, commentId, message, accessToken) {
    try {
      const response = await axios.post(
        `${this.config.graphApiUrl}/${mediaId}/replies`,
        {
          message,
          comment_id: commentId,
          access_token: accessToken,
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Error replying to comment:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}

module.exports = new InstagramService();
