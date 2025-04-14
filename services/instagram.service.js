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
          fields: "id,username,account_type,media_count,profile_picture_url",
          access_token: accessToken,
        },
      });
      console.log("Response from getUserProfile:", response);

      // Try to fetch profile picture separately with error handling
      let profilePicture = null;
      // try {
      //   const pictureResponse = await axios.get(
      //     `${this.config.graphApiUrl}/${response.data.id}/picture`,
      //     {
      //       params: {
      //         access_token: accessToken,
      //         redirect: false,
      //       },
      //     }
      //   );
      //   console.log("Picture response:", pictureResponse);

      //   // Check if the picture response has the expected structure
      //   if (
      //     pictureResponse.data &&
      //     pictureResponse.data.data &&
      //     pictureResponse.data.data.url
      //   ) {
      //     profilePicture = pictureResponse.data.data.url;
      //   }
      // } catch (pictureError) {
      //   console.error(
      //     "Error fetching profile picture:",
      //     pictureError.response?.data || pictureError.message
      //   );
      //   // Continue without profile picture
      // }

      // Combine profile data with picture data (if available)
      return {
        ...response.data,
        profile_picture: response.data.profile_picture_url,
      };
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
        `${this.config.graphApiUrl}/${commentId}/replies`,
        {
          message,
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
            fields:
              "id,text,created_time,from,comment_count,like_count,message_tags,parent,permalink_url",
            access_token: accessToken,
          },
        }
      );
      console.log("Response from getMediaComments:", response);

      // Check if we have pagination but empty data
      if (
        response.data &&
        response.data.paging &&
        (!response.data.data || response.data.data.length === 0)
      ) {
        console.log(
          "Pagination exists but no comments found. This might indicate permission issues."
        );
      }

      // For each comment, fetch its replies
      if (
        response.data &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        const commentsWithReplies = await Promise.all(
          response.data.data.map(async (comment) => {
            try {
              const repliesResponse = await this.getCommentReplies(
                comment.id,
                accessToken
              );
              return {
                ...comment,
                replies: repliesResponse.data || [],
              };
            } catch (replyError) {
              console.error(
                `Error fetching replies for comment ${comment.id}:`,
                replyError.response?.data || replyError.message
              );
              return {
                ...comment,
                replies: [],
              };
            }
          })
        );
        response.data.data = commentsWithReplies;
      }

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

  async getCommentReplies(commentId, accessToken) {
    try {
      const response = await axios.get(
        `${this.config.graphApiUrl}/${commentId}/replies`,
        {
          params: {
            fields:
              "id,text,created_time,from,like_count,message_tags,permalink_url",
            access_token: accessToken,
          },
        }
      );

      console.log(`Replies for comment ${commentId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching replies for comment ${commentId}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  }
}

module.exports = new InstagramService();
