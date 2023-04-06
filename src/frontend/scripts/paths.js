const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const htmlDistDir = path.join(distDir, "html");
const jsDistDir = path.join(distDir, "js");
const cssDistDir = path.join(distDir, "css");
const htmlDir = path.join(rootDir, "html");

module.exports = {
    rootDir: rootDir, 
    distDir: distDir, 
    htmlDistDir: htmlDistDir, 
    htmlDir: htmlDir,
    jsDistDir: jsDistDir,
    cssDistDir: cssDistDir
}