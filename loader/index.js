const http = require('http');
const app = require('./app');
const connectDB = require('./startDb'); 
const config = require('../config');

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    const port = process.env.PORT || config.PORT || 3000;

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    server.on('error', (error) => {
      console.error('Server error:', error);
    });

    server.on('close', () => {
      console.log('Server closed');
    });

  } catch (error) {
    console.error('Error starting server:', error.message);
    process.exit(1);
  }
};

startServer();
