import express from "express";
import protect from "../../middleware/auth.js";
import upload from "../../middleware/upload.middleware.js";

import {
    getMyProfile,
    updateProfile,
    becomeWorker,
    uploadProfileImage,
} from "./user.controller.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);

router.put("/profile", protect, updateProfile);

router.put("/become-worker", protect, becomeWorker);

router.post(
    "/upload-profile-image",
    protect,
    upload.single("image"),
    uploadProfileImage
);

export default router;