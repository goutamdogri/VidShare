import { mongoose } from "mongoose" // mongoose ko aise likhne se match ke andar convert karne ke time error nahi ata
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandeler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const { chanelId } = req.params
    if (!chanelId) throw new ApiError(400, "chanelId is required")

    let totalVidAndView = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(chanelId)
            }
        },
        {
            $group: {
                _id: "$owner",
                totalVideos: {
                    $sum: 1
                },
                totalViews: {
                    $sum: "$views"
                }
            }
        }
    ])

    if (totalVidAndView[0] === undefined) {
        totalVidAndView = [
            {
                totalVideos: 0,
                totalViews: 0
            }
        ]
    }

    let totalSubs = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(chanelId)
            }
        },
        {
            $count: "subscribersCount"
        }
    ])
    if (totalSubs[0] === undefined) {
        totalSubs = [
            {
                subscribersCount: 0
            }
        ]
    }

    let totalLikes = await Like.aggregate([ // i don't think it is a good method. i think we should change model to work same in less operation
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $project: {
                            owner: 1
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
            $lookup: {
                from: "communityposts",
                localField: "communityPost",
                foreignField: "_id",
                as: "communityPost",
                pipeline: [
                    {
                        $project: {
                            owner: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                communityPost: {
                    $first: "$communityPost"
                }
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "comment",
                foreignField: "_id",
                as: "comment",
                pipeline: [
                    {
                        $project: {
                            owner: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                comment: {
                    $first: "$comment"
                }
            }
        },
        {
            $match: {
                $or: [
                    {
                        'video.owner': new mongoose.Types.ObjectId(chanelId),
                    },
                    {
                        'communityPost.owner': new mongoose.Types.ObjectId(chanelId),
                    },
                    {
                        'comment.owner': new mongoose.Types.ObjectId(chanelId)
                    }
                ]
            }
        },
        {
            $count: "likesCount"
        }
    ])
    if (totalLikes[0] === undefined) {
        totalLikes = [
            {
                likesCount: 0
            }
        ]
    }

    const stats = {
        totalVideos: totalVidAndView[0].totalVideos,
        totalViews: totalVidAndView[0].totalViews,
        totalSubscribers: totalSubs[0].subscribersCount,
        totalLikes: totalLikes[0].likesCount
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, stats, "channel stats got successfully")
        )

})

const getChannelVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = "date", sortType = 1, isPublished = true } = req.query
    const { chanelId } = req.params
    if (!chanelId) throw new ApiError(404, "chanelId is neccessary")

    let sortingBy = sortBy.toLowerCase().trim() // 'date' or 'views' or 'title' or 'duration'
    let sortingType = Number(sortType) // 1 or -1
    let isPublishedStatus = String(isPublished).toLowerCase().trim() // 'true' or 'false' or 'all'

    if (sortingBy !== "date" && sortingBy !== "views" && sortingBy !== "title" && sortingBy !== "duration") throw new ApiError(404, "Invalid sortBy")
    if (sortingType !== 1 && sortingType !== -1) throw new ApiError(404, "Invalid sorting Type")
    if (isPublishedStatus !== "true" && isPublishedStatus !== "false" && isPublishedStatus !== 'all') throw new ApiError(400, "Invalid published Status")

    if (sortingBy === "date") sortingBy = "createdAt";

    let myMatch = {
        owner: new mongoose.Types.ObjectId(chanelId),
    }

    if (isPublishedStatus !== 'all') {
        // isPublishedStatus = JSON.parse(isPublishedStatus)
        myMatch.isPublished = isPublishedStatus === 'true' // alternative way to assign truthy or falsy value. if isPublishedStatus = 'true' then "myMatch.isPublished: true" set as boolean value.
    }

    let myAggregate = Video.aggregate([
        {
            $match: myMatch
        },
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
    ])
    let options = {
        page,
        limit,
        sort: {
            [sortingBy]: sortingType
        }
    }

    let videos;
    await Video.aggregatePaginate(myAggregate, options, (err, results) => {
        if (err) {
            throw new ApiError(500, err)
        }

        if (results) {
            videos = results
        }
    }
    )

    if (!videos) throw new ApiError(404, "Videos not found")

    return res
        .status(200)
        .json(
            new ApiResponse(200, videos, "Videos fetched successfully")
        )
})

export {
    getChannelStats,
    getChannelVideos
}