import bcrypt from "bcryptjs";
import User from "../user/user.model.js";
import ApiError from "../../utils/ApiError.js";
import { generateToken } from "../../utils/jwt.js";

class AuthService {
    async register(data) {
        const { name, email, password, phone, role } = data;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new ApiError(409, "Email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role
        });

        const token = generateToken(user._id);

        return { user, token };
    }

    async login(data) {
        const { email, password } = data;

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            throw new ApiError(401, "Invalid email or password");
        }

        if (user.authProvider === "google") {
            throw new ApiError(
                400,
                "Please login using Google."
            );
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            throw new ApiError(
                401,
                "Invalid email or password"
            );
        }

        const token = generateToken(user._id);

        return { user, token };
    }
}

export default new AuthService();