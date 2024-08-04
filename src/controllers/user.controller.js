import { asyncHandler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { mongoose } from "mongoose";
import fs from "fs";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // validate na karke save kar do nahi to required filled ke baja se save nahi ho payega
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access and refresh token"
    );
  }
};

async function getUsername(){
  const usernameOptions =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let username;
  let f = true;
  while (f) {
    username = "";
    for (let index = 0; index < 10; index++) {
      username +=
        usernameOptions[Math.floor(Math.random() * usernameOptions.length)];
    }
    const existedUsername = await User.findOne({ username });
    if (!existedUsername) {
      f = false;
    }
  }
  return username;
}

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - iske liye bade company me ak alak file hote hai
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res
  const { fullName, email, password } = req.body; // yeh form data parse multer middleware karke bheja hai.

  // ".files" ka access multer middleware ne diya hai. name mai avatar diya hai isiliye ".avatar".

  let avatarLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files.avatar[0].path;
  }

  // const avatarLocalPath = req.files?.avatar[0]?.path; // file path mil jayega jo humare server pe multer nai upload kiya hai. and yeh data humne return karaya hai multer function likhte time. "?" cannot understand it's behaviour

  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    deleteLocalFile(coverImageLocalPath);
    throw new ApiError(400, "Avatar file is required");
  }

  async function deleteLocalFile(avatar, coverImage) {
    if (avatar) fs.unlinkSync(avatar);
    if (coverImage) fs.unlinkSync(coverImage);
  }

  if ([fullName, email, password].some((field) => field?.trim() === "")) {
    deleteLocalFile(avatarLocalPath, coverImageLocalPath);
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    deleteLocalFile(avatarLocalPath, coverImageLocalPath);
    throw new ApiError(409, "user with email or username already exists");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(500, "avatar cloud url does not get");
  }

  const username = getUsername();

  const user = await User.create({
    fullName, // fullName: fullName
    avatar: avatar.secure_url,
    coverImage: coverImage?.secure_url || "",
    email,
    password,
    username,
  });

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const createduser = await User.findById(user._id).select(
    "-password -refreshToken" // syntax hi aisa hai. iske andar jo field name rahega usko chodke sara select ho jayega
  );

  if (!createduser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };
  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: createduser,
          accessToken,
          refreshToken,
        },
        "User registered Successfully"
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  // find the user
  // password check
  // access and referesh token
  // send token to secure cookie

  const { email, username, password } = req.body;
  // console.log(email);

  if (!username && !email) {
    //alternative (!(username || email))
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credential");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  // send token to secure cookie
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // by default cookie sab modify kar sakte hai. below code karne se humara cookie only server se modify hoga.
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken, // token bhej rahe hai agar user ki jarorat ho.
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken; // mobile se cookies body mai ate hai

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id).select("-password");

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken, // token bhej rahe hai agar user ki jarorat ho.
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body; // quki multer middleware use nahi kiya gya hai issiliye idhar form data parse nahi ho raha hai. so, body ke andar data nahi a raha hai. use body-parser or send json data from browser/postman

  const user = await User.findById(req.user?._id);
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, username, description } = req.body;

  if (fullName) {
    await User.findByIdAndUpdate(req.user?._id, {
      $set: {
        fullName,
      },
    });
  }

  if (email) {
    await User.findByIdAndUpdate(req.user?._id, {
      $set: {
        email,
      },
    });
  }

  if (username) {
    await User.findByIdAndUpdate(req.user?._id, {
      $set: {
        username,
      },
    });
  }

  if (description) {
    await User.findByIdAndUpdate(req.user?._id, {
      $set: {
        description,
      },
    });
  }

  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path; // file path mil jayega jo humare server pe multer nai upload kiya hai. and yeh data humne return karaya hai multer function likhte time.

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  await deleteFromCloudinary(req.user?.avatar);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true } // so that findByIdAndUpdate returns the document after update
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path; // file path mil jayega jo humare server pe multer nai upload kiya hai. and yeh data humne return karaya hai multer function likhte time.

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image file is required");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage) {
    throw new ApiError(400, "Error while uploading on cover Image");
  }

  await deleteFromCloudinary(req.user?.coverImage);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "channelId is required");
  }

  const channel = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          if: { $in: [req.user?._id, "$subscribers.subscriber"] },
          then: true,
          else: false,
        },
      },
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "Channel fetched successfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id), // req.user_id yeh ak string deta hai jo ki mongodb id nahi hai. see an mongodb id, unhape parenthesis ke andar jo string hai ohi req.user._id deta hai. mongoose behind the scene issko mongodb id mai convert kar deta hai. lekin aggregate ke andar aisa nahi hota, code directly jata hai, issiliye code ko mongodb id mai convert karneke liye yeh code likha gaya hai.
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          // ab hum videos ke andar pounch gaye hai
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                // ab hum nested wala owner ke andar pounch gaya
                {
                  $project: {
                    // nested wala owner ka field select kar rahe hai
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watck History fetched Successfully"
      )
    );
});

export {
  generateAccessAndRefereshTokens,
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  getUsername
};
