import express from "express";
import { getActivities ,deleteActivity ,updateActivity} from "../controllers/Activity.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/get", getActivities);
router.delete('/remove/:id', deleteActivity);
router.put('/update/:id', updateActivity);
// router.get("/:userId/posts", verifyToken, getUserPosts);

// /* UPDATE */
// router.patch("/:id/like", verifyToken, likePost);

export default router;
