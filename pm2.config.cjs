module.exports = {
  apps: [
    {
      name: "material-edit-app",
      script: "./.output/server/index.mjs",
      instances: "2",
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "12G",

      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "0.0.0.0"
      }
    }
  ]
};