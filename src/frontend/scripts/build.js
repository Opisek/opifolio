const webpack = require("webpack");
const webpackConfig = require("./webpack.config");
const fs = require("fs");
const path = require("path");
const paths = require("./paths");

console.log('Clearing dist');
fs.rmSync(paths.distDir, { recursive: true, force: true });

console.log("Collecting files");
const htmlFiles = fs.readdirSync(paths.htmlDir);

fs.writeFileSync(
    path.join(paths.rootDir, "entry.js"),
    htmlFiles.map(file => `require("${path.join(paths.htmlDir, file)}");`).reduce((accumulator, current) => accumulator + current)
);

console.log("Running webpack");
webpack(webpackConfig(htmlFiles), (error, stats) => {
    if (error) console.error(error);
    console.error(stats);
});