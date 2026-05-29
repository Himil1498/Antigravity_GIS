module.exports = {
  apps: [
    {
      name: "opticonnect-backend",
      script: "./server.js",
      instances: 1,
      exec_mode: "fork",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        max_old_space_size: 8192,
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 82,
      },
    },
  ],
};
