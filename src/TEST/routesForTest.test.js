import { Router } from "express";
import one from "./asyncHandaler.test.js";

const router = Router();

router.route("/one").post(one);

export default router;