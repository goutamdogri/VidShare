import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getChannelStats } from "../controllers/dashboard.controller.js"

const router = Router()
router.use(verifyJWT)

router.route('/stats/:chanelId').get(getChannelStats)

export default router