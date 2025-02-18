import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";


export const verifyJwt=asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("bearer ","")
        if (!token) {
            throw new ApiError(401,"unauthorized reqest");   
        }
        const decodedTokken=verifyJwt(token,ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodedTokken._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401,"invalid accessToken");    
        }
        req.user=user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid access token");
        
    }
})