import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getLikedVideos, toggleCommentLike, toggleCommunityPostLike, toggleVideoLike } from "../controllers/like.controller.js";

const router = Router()
router.use(verifyJWT)

router.route('/toggle/video/:videoId').post(toggleVideoLike)
router.route('/toggle/comment/:commentId').post(toggleCommentLike)
router.route('/toggle/post/:communityPostId').post(toggleCommunityPostLike)
router.route('/videos').get(getLikedVideos)

export default router