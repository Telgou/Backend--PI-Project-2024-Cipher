import express from "express";
import { login, pregister } from "../controllers/auth.js";

const router = express.Router();

router.post("/pregister", pregister);
router.post("/login", login);

export default router;
