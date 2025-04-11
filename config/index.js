const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  DB: process.env.MONGO_URI,
  PORT: process.env.PORT,
};
