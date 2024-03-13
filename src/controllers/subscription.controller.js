import {mongoose , isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandeler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!channelId) throw new ApiError(400, "channel Id is required")

    const subscribedChannel = await Subscription.findOneAndDelete({
        subscriber: req.user._id,
        channel: channelId
    })

    if(!subscribedChannel) {
        const newSubscription = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })

        return res
            .status(200)
            .json(
                new ApiResponse(200, newSubscription, "new subscription added successfully")
            )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscribedChannel, "subscription removed successfully")
        )
})


const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const {page = 1, limit = 10, sortType = -1} = req.query

    if(!channelId) throw new ApiError(400, "channel Id is required")
    if(sortType !== -1 && sortType !== 1) throw new ApiError(400, "sortType must be 1 or -1")

    const myAggregate = Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
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
                subscriber: {
                    $first: "$subscriber"
                }
            }
        }
    ])

    const options = {
        page,
        limit,
        sort: {
            createdAt: sortType
        }
    }
    await Subscription.aggregatePaginate(myAggregate, options, (err, results) => {
        if(err) throw new ApiError(500, "does  not find document", err)

        return res
            .status(200)
            .json(
                new ApiResponse(200, results, "channel subscribers fetched successfully")
            )
    })
})


const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!subscriberId) throw new ApiError(400, "subscriber Id is required")

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
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
                channel: {
                    $first: "$channel"
                }
            }
        }
    ])
    
    return res
        .status(200)
        .json(
            new ApiResponse(200, subscribedChannels, "subscribed channels fetched successfully")
        )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}