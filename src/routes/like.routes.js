import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getCommentLikesCount, getCommunityPostLikesCount, getLikedVideos, getVideoLikesCount, checkOrToggleCommentLike, checkOrToggleCommunityPostLike, checkOrToggleVideoLike } from "../controllers/like.controller.js";

const router = Router()
router.use(verifyJWT)

router.route('/check/toggle/video/:videoId').post(checkOrToggleVideoLike)
router.route('/check/toggle/comment/:commentId').post(checkOrToggleCommentLike)
router.route('/check/toggle/post/:communityPostId').post(checkOrToggleCommunityPostLike)
router.route('/videos').get(getLikedVideos)
router.route('/video/:videoId').get(getVideoLikesCount)
router.route('/comment/:commentId').get(getCommentLikesCount)
router.route('/communityPost/:communityPostId').get(getCommunityPostLikesCount)

export default router