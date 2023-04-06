import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

export const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const htmlDir = join(rootDir, "html");
export const cssDistDir = join(rootDir, "css");

export const distDir = join(rootDir, "dist");
export const htmlDistDir = join(distDir, "html");
export const jsDistDir = join(distDir, "js");