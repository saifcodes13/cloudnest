import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { env } from "../config/env.js";
import Website from "../models/website.model.js";
import Deployment from "../models/deployment.model.js";
import AppError from "../utils/customError.js";
import ApiResponse from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { extractZip, resolveHostingPath, purgeDirectory } from "../utils/fileExtractor.js";
import { logger } from "../config/logger.js";

// Ensure uploads directory exists
if (!fs.existsSync(env.UPLOAD_DIR)) {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `upload-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Multer File extension filter
const fileFilter = (req, file, cb) => {
  const fileExt = path.extname(file.originalname).toLowerCase();
  if (fileExt !== ".zip") {
    return cb(new AppError("Only compressed .zip archives are allowed", 400), false);
  }
  cb(null, true);
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
}).single("file");

export const uploadMiddleware = (req, res, next) => {
  logger.info("========== UPLOAD START ==========");
  logger.info("1. Upload request received");

  const uploadStart = Date.now();

  multerUpload(req, res, (err) => {
    logger.info("2. Multer callback executed");

    if (err) {
      logger.error("❌ Multer Error:", err);
      return next(err);
    }

    logger.info("3. Multer completed successfully");

    if (!req.file) {
      logger.warn("⚠️ No file found in request");
    } else {
      logger.info("4. File Details:");
      logger.info(`   Original Name : ${req.file.originalname}`);
      logger.info(`   Saved Path    : ${req.file.path}`);
      logger.info(`   Size          : ${req.file.size} bytes`);

      // Check if file actually exists on disk
      const exists = fs.existsSync(req.file.path);
      logger.info(`   Exists on Disk: ${exists}`);

      if (exists) {
        const stats = fs.statSync(req.file.path);
        logger.info(`   Disk Size     : ${stats.size} bytes`);
      }
    }

    const duration = Date.now() - uploadStart;
    req.uploadDuration = duration;

    logger.info(`5. Upload completed in ${duration}ms`);
    logger.info("========== UPLOAD END ==========");

    next();
  });
};

// Zod validator for subdomain names
const websiteNameSchema = z
  .string()
  .trim()
  .min(3, "Website name must be at least 3 characters")
  .max(63, "Website name cannot exceed 63 characters")
  .regex(/^[a-z0-9-]+$/, "Website name can only contain lowercase letters, numbers, and dashes");

/**
 * Handle static website uploads and deployment initialization
 */
export const uploadSite = asyncHandler(async (req, res, next) => {
  const uploadDuration = req.uploadDuration || 0;
  const startProcess = Date.now();

  // 1) Verify file exists in request
  if (!req.file) {
    return next(new AppError("Please upload a .zip archive file", 400));
  }

  // 2) Validate website name
  const nameValidation = websiteNameSchema.safeParse(req.body.name);
  if (!nameValidation.success) {
    // Delete raw uploaded file if name check fails
    fs.unlinkSync(req.file.path);
    const errorDetails = nameValidation.error.errors.map(
      (err) => `${err.path.join(".")}: ${err.message}`
    );
    return next(new AppError("Validation failed", 400, errorDetails));
  }

  const websiteName = nameValidation.data;

  let dbTime = 0;
  const dbStart = Date.now();

  // 3) Retrieve or register the website project
  let website = await Website.findOne({ name: websiteName });

  if (website) {
    // Verify ownership
    if (website.owner.toString() !== req.user._id.toString()) {
      fs.unlinkSync(req.file.path);
      return next(new AppError("This website name is already owned by another user", 403));
    }
  } else {
    // Register new website
    website = await Website.create({
      name: websiteName,
      owner: req.user._id,
    });
  }

  // 4) Compute incremental version number
  const lastDeployment = await Deployment.findOne({ website: website._id }).sort({ version: -1 });
  const nextVersion = lastDeployment ? lastDeployment.version + 1 : 1;

  // 5) Create pending Deployment record
  const deployment = await Deployment.create({
    website: website._id,
    status: "pending",
    zipPath: req.file.path,
    version: nextVersion,
  });

  dbTime += Date.now() - dbStart;

  // 6) Extract archive files to hosted-sites/
  const targetDir = path.join(env.HOSTED_DIR, website.name, deployment._id.toString());

  logger.info("Extracting ZIP...");
  const extractStart = Date.now();
  try {
    await extractZip(req.file.path, targetDir);
  } catch (error) {
    logger.error(`❌ Zip extraction failed: ${error.message}`, error);
    
    const dbErrStart = Date.now();
    deployment.status = "failed";
    deployment.errorLog = `Extraction error: ${error.message}`;
    await deployment.save();
    dbTime += Date.now() - dbErrStart;

    return next(new AppError("Zip file extraction failed", 500));
  }
  const extractDuration = Date.now() - extractStart;
  logger.info("Extraction completed.");

  logger.info("Creating deployment folder...");
  const folderStart = Date.now();
  // folder is created recursive in extractZip/fs.mkdirSync, so this is a path resolution step
  const folderDuration = Date.now() - folderStart;

  // 7) Audit extraction folder (index.html verification)
  logger.info("Moving files...");
  const moveStart = Date.now();
  const resolvedPath = resolveHostingPath(targetDir);
  const moveDuration = Date.now() - moveStart;

  if (!resolvedPath) {
    // Purge target directories if index.html is missing
    purgeDirectory(targetDir);
    
    const dbErrStart = Date.now();
    deployment.status = "failed";
    deployment.errorLog = "Invalid build: index.html was not found in the root folder";
    await deployment.save();
    dbTime += Date.now() - dbErrStart;

    return next(new AppError("Invalid build: index.html was not found in the root folder", 400));
  }

  // 8) Finalize deployment details
  const dbFinalStart = Date.now();
  deployment.status = "deployed";
  deployment.extractedPath = resolvedPath;
  await deployment.save();
  dbTime += Date.now() - dbFinalStart;

  // Create or update the 'active' symlink pointing to the new deployment folder
  logger.info("Creating symlink...");
  const symlinkStart = Date.now();
  const activeSymlinkPath = path.join(env.HOSTED_DIR, website.name, "active");
  try {
    let symlinkExists = false;
    try {
      fs.lstatSync(activeSymlinkPath);
      symlinkExists = true;
    } catch {
      // Ignored: File or symlink does not exist
    }

    if (symlinkExists) {
      fs.unlinkSync(activeSymlinkPath);
    }
    fs.symlinkSync(resolvedPath, activeSymlinkPath);
  } catch (err) {
    logger.error(`❌ Failed to create active symlink: ${err.message}`, err);
    
    const dbErrStart = Date.now();
    deployment.status = "failed";
    deployment.errorLog = `Symlink routing error: ${err.message}`;
    await deployment.save();
    dbTime += Date.now() - dbErrStart;

    return next(new AppError("Routing configuration failed", 500));
  }
  const symlinkDuration = Date.now() - symlinkStart;

  logger.info("Saving MongoDB...");
  const dbEndStart = Date.now();
  // Point website to active deployment
  website.activeDeployment = deployment._id;
  await website.save();
  dbTime += Date.now() - dbEndStart;

  logger.info("Deployment completed.");
  
  const processDuration = Date.now() - startProcess;
  const totalDuration = uploadDuration + processDuration;

  logger.info(
    `Performance breakdown for ${websiteName}: ` +
    `upload: ${uploadDuration}ms | ` +
    `save: ${folderDuration}ms | ` +
    `extract: ${extractDuration}ms | ` +
    `move: ${moveDuration}ms | ` +
    `symlink: ${symlinkDuration}ms | ` +
    `database: ${dbTime}ms | ` +
    `total: ${totalDuration}ms`
  );

  return ApiResponse.success(
    res,
    {
      website: {
        id: website._id,
        name: website.name,
      },
      deployment: {
        id: deployment._id,
        status: deployment.status,
        version: deployment.version,
        extractedPath: deployment.extractedPath,
      },
    },
    "Website deployed successfully",
    201
  );
});

/**
 * Retrieve all websites owned by the authenticated user
 */
export const getWebsites = asyncHandler(async (req, res, _next) => {
  const websites = await Website.find({ owner: req.user._id })
    .populate("activeDeployment")
    .sort({ updatedAt: -1 });

  return ApiResponse.success(res, websites, "Websites retrieved successfully");
});
