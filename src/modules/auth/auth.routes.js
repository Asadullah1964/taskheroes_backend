import { Router } from "express";
import protect from "../../middleware/auth.js";

import {
    register,
    login,
    logout,
    getMe,
    googleLogin,
} from "./auth.controller.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.post("/google", googleLogin);

router.post("/logout", logout);

router.get("/me", protect, getMe);

export default router;