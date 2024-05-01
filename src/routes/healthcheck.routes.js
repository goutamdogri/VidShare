import { Router } from "express"
import { authCheck, healthcheck } from "../controllers/healthcheck.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()
router.route('/').get(healthcheck)

router.route("/authCheck").get(verifyJWT, authCheck)

export default router