import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiErrors.js"

const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            throw new ApiError(401, "Unauthorized Request");
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new ApiError(401, "Unauthorized request, token is missing");
        }

        console.log("VERIFY SECRET:", process.env.ACCESS_TOKEN_SECRET ? "exists (length " + process.env.ACCESS_TOKEN_SECRET.length + ")" : "undefined");
        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        req.user = decoded;

        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Token");
    }
})

export default verifyJWT;