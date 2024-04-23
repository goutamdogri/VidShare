import { mongoose } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandeler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";


const getVideoByIdUtil = async (req) => {
    const { videoId } = req.params
    if (!videoId) throw new ApiError(400, "videoId is required")

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
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
                            _id: 1,
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

    if (!video) throw new ApiError(404, "video not find")

    return video[0]
}

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if ([title, description].some((field) => field.trim() === "")) {
        throw new ApiError(400, "Title and Description required");
    }

    let videoLocalPath;
    if (req.files && Array.isArray(req.files.video) && req.files.video.length > 0) {
        videoLocalPath = req.files.video[0].path;
    }
    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required");
    }
    let thumbnailLocalPath;
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0].path;
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);
    if (!videoFile) {
        throw new ApiError(500, "Error occurs while uploading video on cloud")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail) {
        throw new ApiError(500, "Error occurs while uploading thumbnail on cloud")
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.secure_url,
        thumbnail: thumbnail.secure_url,
        duration: videoFile.duration,
        owner: req.user._id,
    })
    if (!video) {
        throw new ApiError(500, "Error occurs while creating video")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "video Published successfully")
        )

})

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = "date", sortType = 1, isPublished = true } = req.query

    // if(!userId) throw new ApiError(404, "userId is neccessary")

    let sortingBy = sortBy.toLowerCase().trim() // 'date' or 'views' or 'title' or 'duration'
    let sortingType = Number(sortType) // 1 or -1
    let isPublishedStatus = isPublished.toLowerCase().trim() // 'true' or 'false' or 'all'

    if (sortingBy !== "date" && sortingBy !== "views" && sortingBy !== "title" && sortingBy !== "duration") throw new ApiError(404, "Invalid sortBy")
    if (sortingType !== 1 && sortingType !== -1) throw new ApiError(404, "Invalid sorting Type")
    if (isPublishedStatus !== "true" && isPublishedStatus !== "false" && isPublishedStatus !== 'all') throw new ApiError(400, "Invalid published Status")

    if (sortingBy === "date") sortingBy = "createdAt";

    let myMatch = {
        // owner: new mongoose.Types.ObjectId(userId),
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
                            _id: 1,
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

const getVideoById = asyncHandler(async (req, res) => {
    const video = await getVideoByIdUtil(req)
    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "video get successfully")
        )
})

const updateVideo = asyncHandler(async (req, res) => {
    let { title, description } = req.body
    const video = await getVideoByIdUtil(req)

    if (title === undefined) title = video.title
    if (description === undefined) description = video.description
    title = title.trim()
    description = description.trim()
    if (title === video.title && description === video.description && !(req.file && req.file.path)) {
        throw new ApiError(400, "Please change title or description or thumbnail")
    } else if ((title === "" || description === "")) {
        throw new ApiError(400, "title and description required")
    }

    let thumbnail = video.thumbnail;
    if (req.file && req.file.path) {
        const thumbnailLocalPath = req.file.path
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        await deleteFromCloudinary(video.thumbnail)
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        video._id,
        {
            title,
            description,
            thumbnail: thumbnail.secure_url
        },
        { new: true }
    )

    if (!updatedVideo) {
        throw new ApiError(500, "video not update successfully")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedVideo, "video updated successfully")
        )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const video = await getVideoByIdUtil(req)
    if (!video) throw new ApiError(404, "video not found")

    await deleteFromCloudinary(video.videoFile)
    await deleteFromCloudinary(video.thumbnail)

    const deletedVideo = await Video.findByIdAndDelete(video._id)
    if (!deletedVideo) {
        throw new ApiError(500, "video does not delete")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, deletedVideo, "video deleted successfully")
        )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const video = await getVideoByIdUtil(req)
    if (!video) throw new ApiError(404, "video does not get")

    const toggledPublishVideo = await Video.findByIdAndUpdate(
        video._id,
        {
            isPublished: !video.isPublished
        },
        { new: true }
    )

    if (!toggledPublishVideo) throw new ApiError(500, "publish status does not toggled successfully")

    return res
        .status(200)
        .json(
            new ApiResponse(200, toggledPublishVideo, "publish status toggled successfully")
        )
})

const addViewCount = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) throw new ApiError(400, "videoId is required")

    // NOTE: video added to watchhistoryarray continuously multiple time. we need to add video once if continuous. and we can remove video from past history if user watch that video again thereafter.
    const watchHistoryUpdate = await User.findByIdAndUpdate(
        req.user._id,
        {
            $push: {
                watchHistory: videoId
            }
        },
        { new: true }
    )

    if (!watchHistoryUpdate) throw new ApiError(500, "video does not added to watchHistory successfully")

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: {
                views: 1
            }
        },
        { new: true }
    )

    if (!video) throw new ApiError(404, "video not found")

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "view count increased by 1 successfully")
        )
})

export {
    publishVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    addViewCount
}