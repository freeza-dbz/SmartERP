import {
    registerUser,
    loginUser
} from "../services/user.services.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { generateAccessToken } from "../utils/jwt.js"
import User from "../models/user.models.js"
import bcrypt from "bcrypt"

const register = asyncHandler(async (req, res) => {
    const user = await registerUser(req.body)

    // const createdUser = { id: user.id, name: user.fullName, email: user.email };

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                user,
                "User created successfully"
            )
        )
})

const login = asyncHandler(async (req, res) => {
    const user = await loginUser(req.body);

    const token = generateAccessToken(user);

    const loggedInUser = { id: user._id, name: user.fullName, email: user.email, username: user.username };

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            { user: loggedInUser, token },
            "User login successful"
        ))
})




const updateProfile = asyncHandler(async (req, res) => {
    const { fullName, username, email, currentPassword, newPassword } = req.body;
    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId).select('+password');
    if (!user) throw new ApiError(404, 'User not found');

    // Update basic fields
    if (fullName) user.fullName = fullName;
    if (username) user.username = username;
    if (email) user.email = email.toLowerCase();

    // Handle password change
    if (newPassword) {
        if (!currentPassword) throw new ApiError(400, 'Current password is required to set a new password');
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) throw new ApiError(401, 'Current password is incorrect');
        user.password = newPassword; // pre-save hook will hash it
    }

    await user.save();

    const updatedUser = { id: user._id, name: user.fullName, email: user.email, username: user.username };

    return res.status(200).json(new ApiResponse(200, { user: updatedUser }, 'Profile updated successfully'));
})

export {
    register,
    login,
    updateProfile
}