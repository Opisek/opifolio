import webpack from "webpack";
import webpackConfig from "./webpack.config.js";
import { rmSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import { distDir, htmlDir, rootDir } from "./paths.js";

console.log("Clearing dist");
rmSync(distDir, { recursive: true, force: true });

console.log("Collecting files");
const htmlFiles = readdirSync(htmlDir);

writeFileSync(
    join(rootDir, "entry.js"),
    htmlFiles.map(file => `require("${join(htmlDir, file)}");`).reduce((accumulator, current) => accumulator + current)
);

console.log("Running webpack");
webpack(webpackConfig(htmlFiles), (error, stats) => {
    if (error) console.error(error);
    console.error(stats);
});