import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandeler.js";
import { Comment } from "../models/comment.model.js";


const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId) throw new ApiError(404, "videoId is neccessary")
    
    const myAggregate = Comment.aggregate([
        {
            $match: {
                video: videoId,
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
                            username: 1,
                            fullName: 1,
                            avatar: 1,
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
    const options = {
        page,
        limit,
        sort: {
            createdAt: 1
        }
    }

    let comments;
    await Comment.aggregatePaginate(myAggregate, options, (err, results) => {
            if (err) {
                throw new ApiError(500, err)
            }

            if (results) {
                comments = results
            }
        }
    )

    if (!comments) throw new ApiError(404, "comments not found, either videoId is wrong or error occurs while finding comments")

    return res
            .status(200)
            .json(
                new ApiResponse(200, comments, "comments fetched successfully")
            )
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const { content } = req.body

    if(!videoId) throw new ApiError(404, "videoId is neccessary")

    if(content === undefined || content.trim() === "") throw new ApiError(404, "content can't be empty")

    const comment = await Comment.create({
        video: videoId,
        owner: req.user._id,
        content
    })

    return res
        .status(201)
        .json(
                new ApiResponse(201, comment, "comment added successfully")
            )
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const { content } = req.body

    if(!commentId) throw new ApiError(404, "videoId is neccessary")

    if(content === undefined || content.trim() === "") throw new ApiError(404, "content can't be empty")

    const updatedComment = await Comment.findOneAndUpdate({
        _id: commentId,
        owner: req.user._id
    },
    {
        content
    })

    return res
        .status(201)
        .json(
                new ApiResponse(201, updatedComment, "comment added successfully")
            )

})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    if(!commentId) throw new ApiError(404, "commentId is neccessary")

    const deletedComment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user._id
    })

    return res
        .status(201)
        .json(
                new ApiResponse(201, deletedComment, "comment deleted successfully")
            )
})

export { getVideoComments, addComment, updateComment, deleteComment }