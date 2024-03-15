import express from "express";
import { deletePreUser, getPreUsers, login, pregister, verifyuser } from "../controllers/auth.js";
import { verifyToken } from "../middleware/auth.js";
import { restrict } from "../middleware/role-authorize.js";

const router = express.Router();

router.post("/login", login);

// PREREGISTRATION
router.post("/pregister", pregister);
router.put("/verifyuser/:email/:valid", verifyToken, restrict('admin', 'coordinator', 'dephead'), verifyuser);
router.get("/preusers", verifyToken, restrict('admin', 'coordinator', 'dephead'), getPreUsers);
router.delete("/preusers/:email/delete", verifyToken, restrict('admin', 'coordinator', 'dephead'), deletePreUser);

export default router;
