const path = require('path');

module.exports = {
  webpack: (config) => {
    config.output = {
      ...config.output,
      path: path.resolve(__dirname, 'build'), // This stays inside frontend/build
    };
    return config;
  },
};
