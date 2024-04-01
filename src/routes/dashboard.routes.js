import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js"

const router = Router()
router.use(verifyJWT)

router.route('/stats/:chanelId').get(getChannelStats)
router.route('/stats/videos/:chanelId').get(getChannelVideos)

export default router