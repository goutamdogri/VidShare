import { Feedback } from "../models/feedback.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandeler.js";

const getFeedback = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  let myAggregate = Feedback.aggregate([]);

  let options = {
    page,
    limit,
    sort: {
      createdAt: 1,
    },
  };

  let feedback;
  await Feedback.aggregatePaginate(myAggregate, options, (err, results) => {
    if (err) {
      throw new ApiError(500, err);
    }

    if (results) {
      feedback = results;
    }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, feedback, "feedback fetched successfully"));
});

const addFeedback = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || content?.trim() == "")
    throw new ApiError(400, "feedback content is required");

  const feedback = await Feedback.create({
    owner: req.user._id,
    feedback: content.trim().substring(0, 500),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, feedback, "feedback created successfully"));
});

export { getFeedback, addFeedback };
