import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getComments, updateComment } from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJWT)

router.route('/v/:videoORcommunityPost/:videoIdOrCommunityPostId')
    .get(getComments)
    .post(addComment)

router.route('/c/:commentId')
    .patch(updateComment)
    .delete(deleteComment)

export default router