import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { checkOrToggleCommentDislike, checkOrToggleCommunityPostDislike, checkOrToggleVideoDislike, getCommentDislikesCount, getCommunityPostDiislikesCount, getDislikedVideos, getVideoDislikesCount } from "../controllers/dislike.controller.js";

const router = Router()
router.use(verifyJWT)

router.route('/check/toggle/video/:videoId').post(checkOrToggleVideoDislike)
router.route('/check/toggle/comment/:commentId').post(checkOrToggleCommentDislike)
router.route('/check/toggle/post/:communityPostId').post(checkOrToggleCommunityPostDislike)
router.route('/videos').get(getDislikedVideos)
router.route('/video/:videoId').get(getVideoDislikesCount)
router.route('/comment/:commentId').get(getCommentDislikesCount)
router.route('/communityPost/:communityPostId').get(getCommunityPostDiislikesCount)

export default router