import { asyncHandler } from "../utils/asyncHandeler.js";
import {ApiError} from "../utils/ApiError.js"; 
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - iske liye bade company me ak alak file hote hai
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    


    const {fullName, email, username, password} = req.body
    // console.log("email: ", email);

    if(
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "user with email or username already exists")
    }

    // console.log(req.files);

    // ".files" ka access multer middleware ne diya hai. name mai avatar diya hai isiliye ".avatar". 
    const avatarLocalPath = req.files?.avatar[0]?.path; // file path mil jayega jo humare server pe multer nai upload kiya hai. and yeh data humne return karaya hai multer function likhte time.

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName, // fullName: fullName
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
        
    })

    const createduser = await User.findById(user._id).select(
        "-password -refreshToken" // syntax hi aisa hai. iske andar jo field name rahega usko chodke sara select ho jayega
    )

    if (!createduser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createduser, "User registered Successfully")
    )
})

export {
    registerUser
}