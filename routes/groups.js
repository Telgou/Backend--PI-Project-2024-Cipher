import express from "express";
import { getGroups, getGroupsID, updateGroup,deleteGroup} from "../controllers/group.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/get", getGroups);
router.get("/:groupId/groups", getGroupsID);

/* UPDATE */
router.put("/:groupId/update", updateGroup);

/* Delete*/
router.delete("/:groupId/delete", deleteGroup);

export default router;
