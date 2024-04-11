import { asyncHandler } from "../utils/asyncHandeler.js"
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Like } from "../models/like.model.js"
import { mongoose } from "mongoose"


const checkOrToggleVideoLike = asyncHandler(async (req, res) => {
	const { videoId } = req.params
	if (!videoId) throw new ApiError(400, "videoId is required")
	const { need } = req.query
	const work = need?.trim().toLowerCase()
	if (work !== 'check' && work !== 'toggle') {
		throw new ApiError(400, "need must be either 'check' or 'toggle'")
	}

	if (work == 'check') {
		const likedVideo = await Like.findOne({
			video: videoId,
			likedBy: req.user._id
		})

		if (likedVideo) {
			return res
				.status(200)
				.json(
					new ApiResponse(200, {checkUserVideoLike: true}, "Video already liked by the user")
				)
		} else {
			return res
				.status(200)
				.json(
					new ApiResponse(200, {checkUserVideoLike: false}, "video does not liked by the user")
				)
		}
	}

	if (work == 'toggle') {
		const likedVideo = await Like.findOneAndDelete({
			video: videoId,
			likedBy: req.user._id
		})

		if (!likedVideo) {
			const newLike = await Like.create({
				video: videoId,
				likedBy: req.user._id
			})
			return res
				.status(200)
				.json(
					new ApiResponse(200, {like: newLike, currLikeStatus: true}, "Video liked successfully")
				)
		}

		return res
			.status(200)
			.json(
				new ApiResponse(200, {like: likedVideo, currLikeStatus: false}, "Video unliked successfully")
			)
	}
})

const checkOrToggleCommentLike = asyncHandler(async (req, res) => {
	const { commentId } = req.params
	if (!commentId) throw new ApiError(400, "commentId is required")
	const { need } = req.query
	const work = need?.trim().toLowerCase()
	if (work !== 'check' && work !== 'toggle') {
		throw new ApiError(400, "need must be either 'check' or 'toggle'")
	}

	if (work == 'check') {
		const likedComment = await Like.findOne({
			comment: commentId,
			likedBy: req.user._id
		})

		if (likedComment) {
			return res
				.status(200)
				.json(
					new ApiResponse(200, {checkUserCommentLike: true}, "comment already liked by the user")
				)
		} else {
			return res
				.status(200)
				.json(
					new ApiResponse(200, {checkUserCommentLike: false}, "comment does not liked by the user")
				)
		}
	}

	if (work == 'toggle') {
		const likedComment = await Like.findOneAndDelete({
			comment: commentId,
			likedBy: req.user._id
		})

		if (!likedComment) {
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
	}
})

const checkOrToggleCommunityPostLike = asyncHandler(async (req, res) => {
	const { communityPostId } = req.params
	if (!communityPostId) throw new ApiError(400, "communityPostId is required")
	const { need } = req.query
	const work = need?.trim().toLowerCase()
	if (work !== 'check' && work !== 'toggle') {
		throw new ApiError(400, "need must be either 'check' or 'toggle'")
	}

	if (work == 'check') {
		const likedCommunityPost = await Like.findOne({
			communityPost: communityPostId,
			likedBy: req.user._id
		})

		if (likedCommunityPost) {
			return res
				.status(200)
				.json(
					new ApiResponse(200, {checkUserCommunityPostLike: true}, "communityPost already liked by the user")
				)
		} else {
			return res
				.status(200)
				.json(
					new ApiResponse(200, {checkUserCommunityPostLike: false}, "communityPost does not liked by the user")
				)
		}
	}

	if (work == 'toggle') {
		const likedCommunityPost = await Like.findOneAndDelete({
			communityPost: communityPostId,
			likedBy: req.user._id
		})

		if (!likedCommunityPost) {
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
	}
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

	if (!likedVideos) throw new ApiError(500, "liked videos not found, either user does not like any video yet or error occurs while finding liked videos")

	return res
		.status(200)
		.json(
			new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
		)
})

const getVideoLikesCount = asyncHandler(async (req, res) => {
	const { videoId } = req.params
	if (!videoId) throw new ApiError(400, "videoId is required")

	let videoLikesCount = await Like.aggregate([
		{
			$match: {
				video: new mongoose.Types.ObjectId(videoId)
			}
		},
		{
			$count: "videoLikesCount"
		}
	])
	if (videoLikesCount[0] === undefined) {
		videoLikesCount = [
			{
				videoLikesCount: 0
			}
		]
	}

	return res
		.status(200)
		.json(
			new ApiResponse(200, videoLikesCount[0], "subscriber count fetched successfully")
		)
})

const getCommentLikesCount = asyncHandler(async (req, res) => {
	const { commentId } = req.params
	if (!commentId) throw new ApiError(400, "commentId is required")

	let commentLikesCount = await Like.aggregate([
		{
			$match: {
				comment: new mongoose.Types.ObjectId(commentId)
			}
		},
		{
			$count: "commentLikesCount"
		}
	])
	if (commentLikesCount[0] === undefined) {
		commentLikesCount = [
			{
				commentLikesCount: 0
			}
		]
	}

	return res
		.status(200)
		.json(
			new ApiResponse(200, commentLikesCount[0], "subscriber count fetched successfully")
		)
})

const getCommunityPostLikesCount = asyncHandler(async (req, res) => {
	const { communityPostId } = req.params
	if (!communityPostId) throw new ApiError(400, "communityPostId is required")

	let communityPostLikesCount = await Like.aggregate([
		{
			$match: {
				communityPost: new mongoose.Types.ObjectId(communityPostId)
			}
		},
		{
			$count: "communityPostLikesCount"
		}
	])
	if (communityPostLikesCount[0] === undefined) {
		communityPostLikesCount = [
			{
				communityPostLikesCount: 0
			}
		]
	}

	return res
		.status(200)
		.json(
			new ApiResponse(200, communityPostLikesCount[0], "subscriber count fetched successfully")
		)
})

export { checkOrToggleVideoLike, checkOrToggleCommentLike, checkOrToggleCommunityPostLike, getLikedVideos, getVideoLikesCount, getCommentLikesCount, getCommunityPostLikesCount }