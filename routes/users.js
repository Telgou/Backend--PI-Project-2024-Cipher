import express from "express";
import {
  getUsers,
  getUser,
  getUserFriends,
  addRemoveFriend,
  updateUser,
} from "../controllers/users.js";
import multer from "multer";
import { verifyToken } from "../middleware/auth.js";
import { checkOwnership } from "../middleware/resource-ownership.js";

/* FILE STORAGE */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

const router = express.Router();

/* READ */
router.get("/get", getUsers); // Get users
router.get("/:id", getUser);
router.get("/:id/friends", getUserFriends);

/* UPDATE */
router.patch("/:id/:friendId", checkOwnership, addRemoveFriend);
router.put("/:id/update",verifyToken, checkOwnership, upload.single("picture"), updateUser);

export default router;
