import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { OAuth2Client } from "google-auth-library";
import User from "../user/user.model.js";
import { generateToken } from "../../utils/jwt.js";
import ApiError from "../../utils/ApiError.js";
import authService from "./auth.service.js";

import {
    registerSchema,
    loginSchema
} from "./auth.validation.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req, res) => {

    const validatedData = registerSchema.parse(req.body);

    const { user, token } = await authService.register(validatedData);

    res.cookie("token", token, cookieOptions);

    user.password = undefined;

    return res.status(201).json(
        new ApiResponse(
            201,
            "Registration successful",
            user
        )
    );
});

export const login = asyncHandler(async (req, res) => {

    const validatedData = loginSchema.parse(req.body);

    const { user, token } = await authService.login(validatedData);

    res.cookie("token", token, cookieOptions);

    user.password = undefined;

    return res.json(
        new ApiResponse(
            200,
            "Login successful",
            user
        )
    );
});

export const logout = asyncHandler(async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });

    return res.status(200).json(
        new ApiResponse(200, "Logout successful")
    );
});

export const getMe = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            "User fetched successfully",
            req.user
        )
    );
});

export const googleLogin = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        throw new ApiError(400, "Google token is required");
    }

    const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;
    const googleId = payload.sub;

    let user = await User.findOne({ email });

    if (!user) {
        user = await User.create({
            name,
            email,
            googleId,
            authProvider: "google",
            profileImage: picture,
            role: "client",
            isVerified: true,
        });
    }

    const jwtToken = generateToken(user._id);

    res.cookie("token", jwtToken, cookieOptions);

    user.password = undefined;

    return res.status(200).json(
        new ApiResponse(
            200,
            "Google login successful",
            user
        )
    );
});