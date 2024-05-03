import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addFeedback,
  getFeedback,
} from "../controllers/feedback.controller.js";

const router = new Router();
router.use(verifyJWT);

router.route("/").get(getFeedback).post(addFeedback);

export default router;
