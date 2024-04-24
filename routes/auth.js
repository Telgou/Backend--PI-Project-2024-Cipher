import express from "express";
<<<<<<< Updated upstream
import { login } from "../controllers/auth.js";
=======
import { login,loginn,register,logOut } from"../controllers/auth.js";
>>>>>>> Stashed changes

const router = express.Router();

router.post("/login", login);
router.post("/loginn", loginn);
router.post("/register", register);
router.get("/logout/:id", logOut);

export default router;