import jwt from "jsonwebtoken"

export const generateAccessToken = (user) => {
    console.log("SIGN SECRET:", process.env.ACCESS_TOKEN_SECRET ? "exists (length " + process.env.ACCESS_TOKEN_SECRET.length + ")" : "undefined");
    return jwt.sign(
        { 
            id: user._id || user.id,
            email: user.email,
            name: user.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        { 
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY 
        }
    )
}