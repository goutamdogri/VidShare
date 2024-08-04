import { Router } from "express";
import googleOauthHandeler from "../controllers/googleOauthHandeler.controller.js";

const router = Router();

router.route("/google").get(googleOauthHandeler);

export default router;
