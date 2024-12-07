module.exports = {
    apps: [
      {
        name: "screenshot-automation",
        script: "src/app.js",
        cron_restart: "0 0 * * 0,3", // Runs every Sunday and Wednesday at midnight
        watch: false,
        env: {
          NODE_ENV: "production"
        }
      }
    ]
  };
  