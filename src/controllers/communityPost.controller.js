import { asyncHandler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { CommunityPost } from "../models/communityPost.model.js";
import { mongoose } from "mongoose";

const createCommunityPost = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if(content === undefined || content.trim() === "") throw new ApiError(404, "content can't be empty")

    const communityPost = await CommunityPost.create({
        content,
        owner: req.user._id
    })

    return res
        .status(201)
        .json(
            new ApiResponse(201, communityPost, "Community post created successfully")
        )
})

const getUserCommunityPosts = asyncHandler(async (req, res) => {
    const {userId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!userId) throw new ApiError(404, "userId is neccessary")
    
    const myAggregate = CommunityPost.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
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
            createdAt: -1
        }
    }

    let communityPost;
    await CommunityPost.aggregatePaginate(myAggregate, options, (err, results) => {
            if (err) {
                throw new ApiError(500, err)
            }

            if (results) {
                communityPost = results
            }
        }
    )

    if (!communityPost) throw new ApiError(404, "communityPost not found, either userId is wrong or error occurs while finding community Post")

    return res
            .status(200)
            .json(
                new ApiResponse(200, communityPost, "comments fetched successfully")
            )
})

const updateCommunityPost = asyncHandler(async (req, res) => {
    const {communityPostId} = req.params
    const { content } = req.body

    if(!communityPostId) throw new ApiError(404, "communityPostId is neccessary")

    if(content === undefined || content.trim() === "") throw new ApiError(404, "content can't be empty")

    const updatedCommunityPost = await CommunityPost.findOneAndUpdate({
        _id: communityPostId,
        owner: req.user._id
    },
    {
        content
    },
    {new: true}
    )

    if(!updatedCommunityPost) throw new ApiError(404, "community post does not find, either communityPostId is wrong or error occurred when finding document") 

    return res
        .status(201)
        .json(
                new ApiResponse(201, updatedCommunityPost, "Community Post updated successfully")
            )
})

const deleteCommunityPost = asyncHandler(async (req, res) => {
    const {communityPostId} = req.params

    if(!communityPostId) throw new ApiError(404, "communityPostId is neccessary")

    const deletedCommunityPost = await CommunityPost.findOneAndDelete({
        _id: communityPostId,
        owner: req.user._id
    })

    if(!deletedCommunityPost) throw new ApiError(404, "community post does not find, either communityPostId is wrong or error occurred when finding document")

    return res
        .status(201)
        .json(
                new ApiResponse(201, deletedCommunityPost, "Community Post deleted successfully")
            )
})

export {
    createCommunityPost,
    getUserCommunityPosts,
    updateCommunityPost,
    deleteCommunityPost
}