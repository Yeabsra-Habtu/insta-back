require("dotenv").config();

module.exports = {
  clientId: process.env.INSTAGRAM_CLIENT_ID,
  clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
  redirectUri: process.env.INSTAGRAM_REDIRECT_URI,
  // Instagram Graph API endpoints
  authUrl: "https://api.instagram.com/oauth/authorize",
  tokenUrl: "https://api.instagram.com/oauth/access_token",
  graphApiUrl: "https://graph.instagram.com",
  // Scopes required for the application
  scopes: ["user_profile", "user_media"],
};
