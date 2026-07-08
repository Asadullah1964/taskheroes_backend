import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import userService from "./user.service.js";

export const getMyProfile = asyncHandler(async (req, res) => {
    const user = await userService.getMyProfile(req.user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Profile fetched successfully",
            user
        )
    );
});

export const updateProfile = asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(
        req.user._id,
        req.body
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Profile updated successfully",
            user
        )
    );
});

export const becomeWorker = asyncHandler(async (req, res) => {
    const user = await userService.becomeWorker(
        req.user._id,
        req.body
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "You are now registered as a worker",
            user
        )
    );
});

export const uploadProfileImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new Error("Image is required");
    }

    const user = await userService.uploadProfileImage(
        req.user._id,
        req.file.path
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Profile image uploaded successfully",
            user
        )
    );
});