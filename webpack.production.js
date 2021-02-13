const configFn = require("./webpack.config.js");

module.exports = env => {
  const config = configFn(env);
  config.mode = "production";
  config.output.publicPath = "/";
  return config;
};
