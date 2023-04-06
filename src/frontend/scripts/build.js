import { rmSync, readdirSync, writeFileSync } from "fs";
import { join, parse } from "path";
import webpack from "webpack";
import { generate } from "critical";

import { distDir, htmlDir, rootDir } from "./paths.js";
import webpackConfig from "./webpack.config.js";

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
    if (webpackError) console.error(webpackError);
    if (webpackStats.warnings) console.error(webpackStats.warnings);
    if (webpackStats.errors) console.error(webpackStats.errors);
    console.log(webpackStats);

    console.log("Inlining critical CSS");
    await Promise.all(
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
    
    console.log("Compressing files");
})();