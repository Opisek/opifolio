import { rmSync, readdirSync, writeFileSync, createReadStream, createWriteStream } from "fs";
import { extname, join, parse } from "path";
import webpack from "webpack";
import { generate } from "critical";

import { cssDistDir, distDir, htmlDir, htmlDistDir, jsDistDir, rootDir } from "./paths";
import webpackConfig from "./webpack/webpack.config";
import { createGzip } from "zlib";

(async () => {
    console.log("Clearing dist");
    rmSync(distDir, { recursive: true, force: true });

    console.log("Collecting files");
    const htmlFiles = readdirSync(htmlDir);
    writeFileSync(
        join(rootDir, "entry.js"),
        htmlFiles.map(file => `require("${join(htmlDir, file)}");`).reduce((accumulator, current) => accumulator + current)
    );

    console.log("Running webpack");
    const [webpackError, webpackStats] = await new Promise(res => webpack(webpackConfig(htmlFiles), (error, stats) => res([error, stats])));
    if (webpackError) console.error(`Webpack Errors:\n${webpackError}`);
    if (webpackStats.hasWarnings()) console.error(webpackStats.toJson().warnings);
    if (webpackStats.hasErrors()) console.error(webpackStats.toJson().errors);

    console.log("Inlining critical CSS");
    await inlineCriticalCss(htmlFiles);
    
    console.log("Compressing files");
    compressFiles(htmlDistDir, [".html"]);
    compressFiles(cssDistDir, [".css"]);
    compressFiles(jsDistDir, [".js"]);
})();

function inlineCriticalCss(htmlFiles) {
    return Promise.all(
        htmlFiles.map(file => `html/${parse(file).name}.html`).map(file => generate({
            base: distDir,
            src: file,
            target: file,
            inline: true,
            inlineImages: true,
            dimensions: [ // https://www.browserstack.com/guide/ideal-screen-sizes-for-responsive-design
                {
                    width: 1920,
                    height: 1080
                },
                {
                    width: 1366,
                    height: 768 
                },
                {
                    width: 360,
                    height: 640 
                }
            ]
        }))
    );
}

async function compressFiles(directory, extensions) {
    const files = readdirSync(directory);
    return Promise.all(
        files
            .filter(file => extensions.includes(extname(file)))
            .map(file => new Promise((resolve, reject) => {
                createReadStream(join(directory, file))
                    .pipe(createGzip())
                    .pipe(createWriteStream(join(directory, `${file}.gz`)))
                    .on("error", reject)
                    .on("finish", resolve);
            }))
    );
}