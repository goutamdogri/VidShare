import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createCommunityPost, deleteCommunityPost, getUserCommunityPosts, updateCommunityPost } from "../controllers/communityPost.controller.js";

const router = Router();
router.use(verifyJWT)

router.route('/').post(createCommunityPost)
router.route('/user/:userId').get(getUserCommunityPosts)

router.route('/:communityPostId')
    .patch(updateCommunityPost)
    .delete(deleteCommunityPost)

export default router