import User from "./user.model.js";
import ApiError from "../../utils/ApiError.js";

const getMyProfile = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return user;
};

const updateProfile = async (userId, data) => {
    const allowedFields = [
        "name",
        "phone",
        "location",
        "profileImage",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
            updateData[field] = data[field];
        }
    });

    if (
        updateData.name &&
        updateData.phone &&
        updateData.location
    ) {
        updateData.isProfileCompleted = true;
    }

    const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        {
            new: true,
            runValidators: true,
        }
    );

    return user;
};

const becomeWorker = async (userId, data) => {
    const {
        title,
        bio,
        skills,
        experience,
        hourlyRate,
        location,
    } = data;

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.role === "worker") {
        throw new ApiError(400, "User is already a worker");
    }

    user.role = "worker";

    user.workerProfile = {
        title,
        bio,
        skills,
        experience,
        hourlyRate,
        location,
    };

    user.location = location;
    user.isProfileCompleted = true;

    await user.save();

    return user;
};

const uploadProfileImage = async (userId, imageUrl) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.profileImage = imageUrl;

    await user.save();

    return user;
};

export default {
    getMyProfile,
    updateProfile,
    becomeWorker,
    uploadProfileImage,
};