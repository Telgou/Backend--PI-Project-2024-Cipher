import express from "express";
import { addComment, deletePost, getFeedPosts, getUserPosts, likePost } from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";
import { checkOwnership } from "../middleware/resource-ownership.js";

const router = express.Router();

/* READ */
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId", verifyToken, getUserPosts);

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);
router.post('/:postId/comments', verifyToken, addComment);

router.delete('/:postId', verifyToken, checkOwnership, deletePost);

router.delete('/:id', deletePost);

export default router;
