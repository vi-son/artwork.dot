const packageName = require("./package.json").name;
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");

module.exports = env => {
  console.log(`ENV: ${env.NODE_ENV} / ${env.production}`);

  return {
    mode: "development",
    devServer: {
      port: 1234,
      historyApiFallback: true
    },
    entry: {
      index: path.resolve(__dirname, "src/js/index.js")
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      publicPath: "/",
      filename: "[name].bundle.js",
      chunkFilename: "[name].bundle.js"
    },
    resolve: {
      extensions: [".js"],
      alias: {}
    },
    optimization: {
      splitChunks: {
        chunks: "all"
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: "babel-loader",
          exclude: /node_modules/
        },
        {
          test: /\.s[ac]ss$/i,
          use: ["style-loader", "css-loader", "sass-loader"]
        },
        {
          test: /\.(woff(2)?|ttf|otf|eot)(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "[name].[ext]",
                outputPath: "fonts/"
              }
            }
          ]
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: "babel-loader"
            },
            {
              loader: "react-svg-loader",
              options: {
                jsx: true // true outputs JSX tags
              }
            }
          ]
        },
        {
          test: /\.(glsl|frag|vert)$/,
          use: ["glslify-import-loader", "raw-loader", "glslify-loader"],
          exclude: /node_modules/
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(env.NODE_ENV)
      }),
      new HtmlWebpackPlugin({
        template: __dirname + "/src/html/index.html",
        filename: "index.html",
        inject: "body"
      }),
      new FaviconsWebpackPlugin(
        path.resolve(`${__dirname}/assets/svg/favicon.svg`)
      ),
      new CopyPlugin({
        patterns: [{ from: path.resolve(__dirname, "assets"), to: "assets" }]
      })
    ]
  };
};
