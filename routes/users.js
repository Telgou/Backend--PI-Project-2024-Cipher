import express from "express";
import {
<<<<<<< Updated upstream
=======
  getAllUsers,
  getUsers,
  setAvatar,
>>>>>>> Stashed changes
  getUser,
  getUserFriends,
  addRemoveFriend,
} from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
<<<<<<< Updated upstream
router.get("/:id", verifyToken, getUser);
=======
router.get("/allusers/:id", getAllUsers);
router.get("/get", getUsers); // Get user info
router.post("/setavatar/:id", setAvatar);
router.get("/:id", getUser);
>>>>>>> Stashed changes
router.get("/:id/friends", verifyToken, getUserFriends);

/* UPDATE */
router.patch("/:id/:friendId", verifyToken, addRemoveFriend);

export default router;
