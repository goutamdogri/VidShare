import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { checkOrToggleCommentDislike, checkOrToggleCommunityPostDislike, checkOrToggleVideoDislike, getDislikedVideos } from "../controllers/dislike.controller.js";


const router = Router()
router.use(verifyJWT)

router.route('/check/toggle/video/:videoId').post(checkOrToggleVideoDislike)
router.route('/check/toggle/comment/:commentId').post(checkOrToggleCommentDislike)
router.route('/check/toggle/post/:communityPostId').post(checkOrToggleCommunityPostDislike)
router.route('/videos').get(getDislikedVideos)

export default router