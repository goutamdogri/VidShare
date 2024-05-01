import { Router } from "express";
import { deletePreview, preview } from "../controllers/preview.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();
router.use(verifyJWT)

router.route("/load").post( upload.single("previewFile"), preview)

router.route("/delete").post(deletePreview)

export default router;