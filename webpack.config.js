const shell = require("shelljs");
const fs = require("fs");
const package = require("./package.json");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");

function getVersionFromGit() {
  const gitTag = shell.exec("git describe --abbrev=0 --tags");
  const gitCommit = shell.exec("git rev-parse --short HEAD");
  return {
    tag: gitTag.trim(),
    commit: gitCommit.trim(),
    package: package,
  };
}

module.exports = (env) => {
  console.log(`ENV: ${env.NODE_ENV} / ${env.production}`);

  return {
    mode: "development",
    devServer: {
      port: 8888,
      historyApiFallback: true,
    },
    entry: {
      index: path.resolve(__dirname, "src/js/index.js"),
    },
    output: {
      path: path.resolve(__dirname, "build/"),
      publicPath: "/",
      filename: "[name].bundle.js",
      chunkFilename: "[name].bundle.js",
    },
    resolve: {
      extensions: [".js"],
      alias: {
        "@sass": path.join(__dirname, "src/sass/"),
      },
    },
    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: "babel-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.s[ac]ss$/i,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
        {
          test: /\.(woff(2)?|ttf|otf|eot)(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "[name].[ext]",
                outputPath: "fonts/",
              },
            },
          ],
        },
        {
          test: /\.(glsl|frag|vert)$/,
          use: ["glslify-import-loader", "raw-loader", "glslify-loader"],
          exclude: /node_modules/,
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: "babel-loader",
            },
            {
              loader: "react-svg-loader",
              options: {
                jsx: true, // true outputs JSX tags
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(env.NODE_ENV),
        "process.env.VERSION": JSON.stringify(getVersionFromGit()),
      }),
      new HtmlWebpackPlugin({
        template: __dirname + "/src/html/index.html",
        filename: "index.html",
        inject: "body",
      }),
      new FaviconsWebpackPlugin(
        path.resolve(`${__dirname}/assets/svg/favicon.svg`)
      ),
      new CopyPlugin([{ from: "assets", to: "assets" }]),
      new WorkboxPlugin.GenerateSW({
        swDest: "sw.js",
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: new RegExp("http://localhost:1234/*.js"),
            handler: "StaleWhileRevalidate",
          },
        ],
        maximumFileSizeToCacheInBytes: 15000000,
      }),
    ],
  };
};
