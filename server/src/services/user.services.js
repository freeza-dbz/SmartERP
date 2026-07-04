import bcrypt from "bcrypt";
import User from "../models/user.models.js";
import { ApiError } from "../utils/ApiErrors.js";

const registerUser = async ({ fullName, username, email, password }) => {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(409, "User Already Existed");
    }

    // Password hashing is handled by the pre-save hook in the User model
    const user = await User.create({
        fullName,
        email,
        password,
        username,
    });

    return user;
}

const loginUser = async ({ email, password }) => {
    // Need to explicitly select password because it's set to select: false in model
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        throw new ApiError(404, "Invalid Email");
    }

    const isPasswordCorrect = await user.correctPassword(password, user.password);

    if (!isPasswordCorrect) {
        throw new ApiError(404, "Invalid Password");
    }

    // Don't return password
    const userObj = user.toObject();
    delete userObj.password;

    return userObj;
}

export {
    registerUser,
    loginUser
}