import { Router } from "express";
import { uploadMiddleware, uploadSite, getWebsites } from "../controllers/website.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protect, getWebsites);
router.post("/upload", protect, uploadMiddleware, uploadSite);

export default router;
