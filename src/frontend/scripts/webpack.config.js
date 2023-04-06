import { join, parse } from "path";
import { rootDir, distDir, htmlDir } from "./paths.js";

import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import ImageMinimizerPlugin from "image-minimizer-webpack-plugin";

export default (htmlFiles) => ({
    mode: "production",
    entry: join(rootDir, "entry.js"),
    output: {
        path: distDir,
        assetModuleFilename: "static/[hash][ext]"
    },
    module: {
        rules: [
            {
                test: /\.ejs$/i,
                exclude: /node_modules/,
                use: ["html-loader", "template-ejs-loader"]
            },
            {
                test: /\.css$/i,
                exclude: /node_modules/,
                type: "asset/resource",
                generator : {
                    filename : "css/[hash][ext]",
                }
            },
            {
                test: /\.ts$/i,
                exclude: /node_modules/,
                type: "asset/resource",
                use: "ts-loader",
                generator : {
                    filename : "js/[hash].js",
                }
            },
            {
                test: /\.(png|jpe?g|webp|gif|svg|)$/i,
                exclude: /node_modules/,
                type: "asset",
                generator : {
                    filename : "images/[hash][ext]",
                }
            }
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    plugins: htmlFiles.map(
        file => new HtmlWebpackPlugin({
            filename: `html/${parse(file).name}.html`,
            template: join(htmlDir, file),
        })
    ).concat([
    ]),
    optimization: {
        minimizer: [
            new ImageMinimizerPlugin({
                generator: [
                    {
                        preset: "webp",
                        implementation: ImageMinimizerPlugin.sharpGenerate,
                        options: {
                            encodeOptions: {
                                webp: {
                                    quality: 75,
                                },
                            },
                        }
                    },
                ],
            })
        ]
    },
});

// https://www.npmjs.com/package/image-minimizer-webpack-plugin
// https://stackoverflow.com/questions/67250804/html-loader-is-not-getting-correct-img-src-path
// https://stackoverflow.com/questions/66907267/webpack-file-loader-duplicates-files