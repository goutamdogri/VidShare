import { asyncHandler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Dislike } from "../models/dislike.model.js";

const checkOrToggleVideoDislike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "videoId is required");
  const { need } = req.query;
  const work = need?.trim().toLowerCase();
  if (work !== "check" && work !== "toggle") {
    throw new ApiError(400, "need must be either 'check' or 'toggle'");
  }

  if (work == "check") {
    const dislikedVideo = await Dislike.findOne({
      video: videoId,
      dislikedBy: req.user._id,
    });

    if (dislikedVideo) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { checkUserVideoDislike: true },
            "Video already disliked by the user"
          )
        );
    } else {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { checkUserVideoDislike: false },
            "video is not disliked by the user"
          )
        );
    }
  }

  if (work == "toggle") {
    const dislikedVideo = await Dislike.findOneAndDelete({
      video: videoId,
      dislikedBy: req.user._id,
    });

    if (!dislikedVideo) {
      const newDislike = await Dislike.create({
        video: videoId,
        dislikedBy: req.user._id,
      });
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { Dislike: newDislike, currDislikeStatus: true },
            "Video disliked successfully"
          )
        );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { Dislike: dislikedVideo, currDislikeStatus: false },
          "Video removed from dislike successfully"
        )
      );
  }
});

const checkOrToggleCommentDislike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) throw new ApiError(400, "commentId is required");
  const { need } = req.query;
  const work = need?.trim().toLowerCase();
  if (work !== "check" && work !== "toggle") {
    throw new ApiError(400, "need must be either 'check' or 'toggle'");
  }

  if (work == "check") {
    const dislikedComment = await Dislike.findOne({
      comment: commentId,
      dislikedBy: req.user._id,
    });

    if (dislikedComment) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { checkUserCommentDislike: true },
            "comment already disliked by the user"
          )
        );
    } else {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { checkUserCommentDislike: false },
            "comment is not disliked by the user"
          )
        );
    }
  }

  if (work == "toggle") {
    const dislikedComment = await Dislike.findOneAndDelete({
      comment: commentId,
      dislikedBy: req.user._id,
    });

    if (!dislikedComment) {
      const newDislike = await Dislike.create({
        comment: commentId,
        dislikedBy: req.user._id,
      });
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { Dislike: newDislike, currDislikeStatus: true },
            "Comment disliked successfully"
          )
        );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { Dislike: dislikedComment, currDislikeStatus: false },
          "Comment removed from dislike successfully"
        )
      );
  }
});

const checkOrToggleCommunityPostDislike = asyncHandler(async (req, res) => {
  const { communityPostId } = req.params;
  if (!communityPostId) throw new ApiError(400, "communityPostId is required");
  const { need } = req.query;
  const work = need?.trim().toLowerCase();
  if (work !== "check" && work !== "toggle") {
    throw new ApiError(400, "need must be either 'check' or 'toggle'");
  }

  if (work == "check") {
    const dislikedCommunityPost = await Dislike.findOne({
      communityPost: communityPostId,
      dislikedBy: req.user._id,
    });

    if (dislikedCommunityPost) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { checkUserCommunityPostDislike: true },
            "communityPost already disliked by the user"
          )
        );
    } else {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { checkUserCommunityPostDislike: false },
            "communityPost is not disliked by the user"
          )
        );
    }
  }

  if (work == "toggle") {
    const dislikedCommunityPost = await Dislike.findOneAndDelete({
      communityPost: communityPostId,
      dislikedBy: req.user._id,
    });

    if (!dislikedCommunityPost) {
      const newDislike = await Dislike.create({
        communityPost: communityPostId,
        dislikedBy: req.user._id,
      });
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { Dislike: newDislike, currDislikeStatus: true },
            "Community Post disliked successfully"
          )
        );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { Dislike: dislikedCommunityPost, currDislikeStatus: false },
          "Community Post removed from disliked successfully"
        )
      );
  }
});

const getDislikedVideos = asyncHandler(async (req, res) => {
  const dislikedVideos = await Dislike.aggregate([
    {
      $match: {
        dislikedBy: req.user._id,
        video: { $exists: true },
      },
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
    {
      $addFields: {
        video: {
          $first: "$video",
        },
      },
    },
    {
      $match: {
        "video.isPublished": true,
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
  ]);

  if (!dislikedVideos)
    throw new ApiError(
      500,
      "disliked videos not found, either user does not dislike any video yet or error occurs while finding liked videos"
    );

  return res
    .status(200)
    .json(
      new ApiResponse(200, dislikedVideos, "Liked videos fetched successfully")
    );
});

export {
  checkOrToggleVideoDislike,
  checkOrToggleCommentDislike,
  checkOrToggleCommunityPostDislike,
  getDislikedVideos,
};
