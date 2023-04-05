const path = require('path');
const paths = require('./paths')

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = (htmlFiles) => ({
    mode: "production",
    entry: path.join(paths.rootDir, "entry.js"),
    output: {
        path: paths.distDir,
        assetModuleFilename: 'static/[hash][ext]'
    },
    module: {
        rules: [
            {
                test: /\.ejs$/i,
                use: ["html-loader", "template-ejs-loader"]
            },
            {
                test: /\.css$/i,
                type: "asset/resource",
                generator : {
                    filename : 'css/[hash][ext]',
                }
            },
            {
                test: /\.(png|jpe?g|webp|gif|svg|)$/i,
                type: "asset",
                generator : {
                    filename : 'images/[hash][ext]',
                }
            }
        ],
    },
    plugins: htmlFiles.map(
        file => new HtmlWebpackPlugin({
            filename: `html/${path.parse(file).name}.html`,
            template: path.join(paths.htmlDir, file),
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
    }
})

// https://www.npmjs.com/package/image-minimizer-webpack-plugin
// https://stackoverflow.com/questions/67250804/html-loader-is-not-getting-correct-img-src-path
// https://stackoverflow.com/questions/66907267/webpack-file-loader-duplicates-files