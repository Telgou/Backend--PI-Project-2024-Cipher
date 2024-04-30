import express from "express";
import { deletePreUser, getPreUsers, login, pregister, verifyuser, transferUser, forgotpassword, resetpassword,loginn,registerr,logOut} from "../controllers/auth.js";
import { verifyToken } from "../middleware/auth.js";
import { restrict } from "../middleware/role-authorize.js";
import { checkOwnership } from "../middleware/resource-ownership.js";

const router = express.Router();

router.post("/login", login);
router.post("/loginn", loginn);
router.post("/registerr", registerr);
// PREREGISTRATION
router.post("/pregister", pregister);
router.put("/verifyuser/:email/:valid", verifyToken, restrict('admin', 'coordinator', 'depHead'), verifyuser);
router.get("/preusers", verifyToken, restrict('admin', 'coordinator', 'depHead'), getPreUsers);
router.delete("/preusers/:email/delete", verifyToken, restrict('admin', 'coordinator', 'depHead'), deletePreUser);

router.post("/forgotpass", forgotpassword);
router.post("/resetpass", resetpassword);
router.post("/:id/changepass", verifyToken, checkOwnership, resetpassword);
router.post("/promote", verifyToken, restrict('admin', 'depHead'), transferUser);
router.get("/logout/:id", logOut);

export default router;
