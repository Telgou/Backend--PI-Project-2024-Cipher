import express from "express";
import { getGroups, getGroupsID,getGroupsByUserId, updateGroup,deleteGroup} from "../controllers/group.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
<<<<<<< Updated upstream
router.get("/get", verifyToken, getGroups);
router.get("/:groupId/groups", verifyToken, getGroupsID);
=======
router.get("/get", getGroups);
router.get("/:groupId/groups", getGroupsID);
router.get("/group", verifyToken, getGroupsByUserId);
>>>>>>> Stashed changes

/* UPDATE */
router.put("/:groupId/update", verifyToken, updateGroup);

/* Delete*/
router.delete("/:groupId/delete", verifyToken, deleteGroup);

export default router;
