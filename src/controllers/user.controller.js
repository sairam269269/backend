import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {apiResponse} from "../utils/ApiResponse.js";
 
const registerUser=  asyncHandler (async (req,res) => {
    
    const {fullName,email,username,password}=req.body
    if(
        [fullName,email,username,password].some((field)=>
        field?.trim()==="")
    ){
        throw new ApiError(400,"all fields are required")
    }
    const existedUser=User.findOne({
        $or:[{username},{email}]
    })
    if (existedUser){
        throw new ApiError(409,"user with email and username already exist");
        
    }
    const avatarLocalPath =req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;
    if (!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    const avatar=uploadOnCloudinary(avatarLocalPath)
    const coverImage=uploadOnCloudinary(coverImageLocalPath)
    
    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })
    const createUser=User.findById(user._id).select("-password -refreshToken")

    if(!createUser){
        throw new ApiError(500,"something went wrong while registering the user");   
    }
    return res.status(201).json(
        new apiResponse(200,createUser,"user registered successfully")
    )

})
 export {registerUser}