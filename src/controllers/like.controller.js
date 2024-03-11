import { asyncHandler } from "../utils/asyncHandeler.js"
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Like } from "../models/like.model.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId) throw new ApiError(400, "videoId is required")

    const likedVideo = await Like.findOneAndDelete({
        video: videoId,
        likedBy: req.user._id
    })

    if(!likedVideo) {
        const newLike = await Like.create({
            video: videoId,
            likedBy: req.user._id
        })
        return res
            .status(200)
            .json(
                new ApiResponse(200, newLike, "Video liked successfully")
            )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideo, "Video unliked successfully")
        )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if(!commentId) throw new ApiError(400, "commentId is required")

    const likedComment = await Like.findOneAndDelete({
        comment: commentId,
        likedBy: req.user._id
    })

    if(!likedComment) {
        const newLike = await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })
        return res
            .status(200)
            .json(
                new ApiResponse(200, newLike, "Comment liked successfully")
            )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, likedComment, "Comment unliked successfully")
        )
})

const toggleCommunityPostLike = asyncHandler(async (req, res) => {
    const { communityPostId } = req.params
    if(!communityPostId) throw new ApiError(400, "communityPostId is required")

    const likedCommunityPost = await Like.findOneAndDelete({
        communityPost: communityPostId,
        likedBy: req.user._id
    })

    if(!likedCommunityPost) {
        const newLike = await Like.create({
            communityPost: communityPostId,
            likedBy: req.user._id
        })
        return res
            .status(200)
            .json(
                new ApiResponse(200, newLike, "Community Post liked successfully")
            )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, likedCommunityPost, "Community Post unliked successfully")
        )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: req.user._id,
                video: { $exists: true }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                video: {
                    $first: "$video"
                }
            }
        },
        {
            $match: {
                "video.isPublished": true
            }
        },
        {
            $sort: {
                createdAt: 1
            }
        }
    ])

    if(!likedVideos) throw new ApiError(500, "liked videos not found, either user does not like any video yet or error occurs while finding liked videos")

    return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
        )
})

export { toggleVideoLike, toggleCommentLike, toggleCommunityPostLike, getLikedVideos }