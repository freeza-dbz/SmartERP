import {
    registerUser,
    loginUser
} from "../services/user.services.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { generateAccessToken } from "../utils/jwt.js"

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




export {
    register,
    login
}