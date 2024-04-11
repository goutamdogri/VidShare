import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { checkOrToggleSubscription, getSubscribedChannels, getSubscriberCount, getUserChannelSubscribers } from "../controllers/subscription.controller.js"

const router = Router()
router.use(verifyJWT)

router.route("/c/:channelId").get(getUserChannelSubscribers)
router.route("/check/toggle/:channelId").post(checkOrToggleSubscription);

router.route("/u/:subscriberId").get(getSubscribedChannels);

router.route("/subscribersCount/:channelId").get(getSubscriberCount)

export default router