import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken=async(userId)=>{
      try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
        
      } catch (error) {
        throw new ApiError(500,"something went wrong in  Access and refresh token");  
      }
}
const registerUser=  asyncHandler (async (req,res) => {
    
    const {fullName,email,username,password}=req.body
    if(
        [fullName,email,username,password].some((field)=>
        field?.trim()==="")
    ){
        throw new ApiError(400,"all fields are required")
    }
    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })
    if (existedUser){
        throw new ApiError(409,"user with email and username already exist");   
    }
    //console.log("Received files:", req.files);
    const avatarLocalPath =req.files?.avatar[0]?.path;
    //const coverImageLocalPath=req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage)
        && req.files.coverImage>0) {
        coverImageLocalPath=req.files.coverImage[0].path    
    }
    if (!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=uploadOnCloudinary(coverImageLocalPath)
    
    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })
    const createUser= await User.findById(user._id).select("-password -refreshToken")

    if(!createUser){
        throw new ApiError(500,"something went wrong while registering the user");   
    }
    return res.status(201).json(
        new ApiResponse(200,createUser,"user registered successfully")
    )
})


const loginUser= asyncHandler (async (req,res) =>{
    const{username,email,password}=req.body

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
    const options={
        httpOnly:true,
        secure:true
    }
    return res
           .status(200)
           .cookie("accessToken",accessToken,options)
           .cookie("refreshToken",refreshToken,options)
           .json(
              new ApiResponse(
                200,{
                 user:loggedInUser ,accessToken , refreshToken
                },
                "user login successful"
        )
        )      
    })
const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
    {
        $set:{
            refreshToken:undefined
        }
    },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res
           .status(200)
           .clearCookie("accessToken",options)
           .clearCookie("refreshToken",options)
           .json(new ApiResponse(200,{},"logged out"))    
})
 export {registerUser,loginUser,logoutUser}