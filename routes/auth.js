import express from "express";
import { login, pregister } from "../controllers/auth.js";
import { verifyToken } from "../middleware/auth.js";
import { restrict } from "../middleware/role-authorize.js";

const router = express.Router();

router.post("/pregister", pregister);
router.post("/login", login);
router.post("/verifyuser", verifyToken,restrict('admin','coordinator','dephead'));

export default router;
