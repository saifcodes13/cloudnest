import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import { logger } from "../config/logger.js";

/**
 * Extract a zip file into a target directory
 * @param {string} zipPath - Source path of the zip archive
 * @param {string} targetDir - Target folder path to unzip to
 * @returns {Promise<void>}
 */
export const extractZip = (zipPath, targetDir) => {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(targetDir, { recursive: true });

    fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: targetDir }))
      .on("close", () => {
        logger.info(`📦 Successfully extracted zip to: ${targetDir}`);
        resolve();
      })
      .on("error", (err) => {
        logger.error(`❌ Zip extraction failed: ${err.message}`);
        reject(err);
      });
  });
};

/**
 * Audit extracted files to find the correct directory containing index.html
 * Handles cases where the user zipped the parent folder rather than the files inside.
 * @param {string} targetDir - Base folder containing extracted assets
 * @returns {string|null} Resolved directory path containing index.html, or null if not found
 */
export const resolveHostingPath = (targetDir) => {
  // 1. Check if index.html is directly in the target root
  if (fs.existsSync(path.join(targetDir, "index.html"))) {
    return targetDir;
  }

  // 2. Check if index.html is nested 1-level deep in a sub-folder
  try {
    const items = fs.readdirSync(targetDir);
    // Ignore macOS junk folders and hidden files
    const cleanItems = items.filter((item) => item !== "__MACOSX" && !item.startsWith("."));

    if (cleanItems.length === 1) {
      const subPath = path.join(targetDir, cleanItems[0]);
      if (fs.statSync(subPath).isDirectory() && fs.existsSync(path.join(subPath, "index.html"))) {
        return subPath;
      }
    }
  } catch (error) {
    logger.error(`❌ Failed to read directory during audit: ${error.message}`);
  }

  return null;
};

/**
 * Recursively delete folder path and all contents
 * @param {string} dirPath - Folder path to remove
 */
export const purgeDirectory = (dirPath) => {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      logger.info(`🧹 Purged directory: ${dirPath}`);
    }
  } catch (error) {
    logger.error(`❌ Failed to purge directory: ${error.message}`);
  }
};
