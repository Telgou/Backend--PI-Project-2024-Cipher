import express from "express";
import { getGroups, getGroupsID, updateGroup,deleteGroup} from "../controllers/group.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/get", verifyToken, getGroups);
router.get("/:groupId/groups", verifyToken, getGroupsID);

/* UPDATE */
router.put("/:groupId/update", verifyToken, updateGroup);

/* Delete*/
router.delete("/:groupId/delete", verifyToken, deleteGroup);

export default router;
