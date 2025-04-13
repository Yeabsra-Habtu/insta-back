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
      // Validate required configuration
      if (
        !this.config.clientId ||
        !this.config.clientSecret ||
        !this.config.redirectUri
      ) {
        throw new Error("Missing required Instagram configuration parameters");
      }

      // Log request parameters for debugging (excluding sensitive data)
      console.log("Token exchange request parameters:", {
        tokenUrl: this.config.tokenUrl,
        redirect_uri: this.config.redirectUri,
        grant_type: "authorization_code",
      });

      console.log("Code:", code);
      const formData = new URLSearchParams();
      formData.append("client_id", this.config.clientId);
      formData.append("client_secret", this.config.clientSecret);
      formData.append("grant_type", "authorization_code");
      formData.append("redirect_uri", this.config.redirectUri);
      formData.append("code", code);

      console.log("FormData:", formData.toString());
      const response = await axios.post(this.config.tokenUrl, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      console.log("Response:", response);

      if (!response.data || !response.data.access_token) {
        throw new Error("Invalid response format from Instagram API");
      }

      return response.data;
    } catch (error) {
      // Enhanced error handling with specific error messages
      let errorMessage = "Failed to exchange code for token";

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `Instagram API Error: ${
          error.response.status
        } - ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response received from Instagram API";
      }

      console.error("Token exchange error:", {
        message: errorMessage,
        originalError: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      throw new Error(errorMessage);
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

  async getMediaComments(mediaId, accessToken) {
    try {
      const response = await axios.get(
        `${this.config.graphApiUrl}/${mediaId}/comments`,
        {
          params: {
            fields: "id,text,timestamp,username,replies",
            access_token: accessToken,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Error fetching comments:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async createComment(mediaId, message, accessToken) {
    try {
      const response = await axios.post(
        `${this.config.graphApiUrl}/${mediaId}/comments`,
        {
          message,
          access_token: accessToken,
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Error creating comment:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}

module.exports = new InstagramService();
