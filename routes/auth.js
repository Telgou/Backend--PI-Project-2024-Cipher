import express from "express";
import multer from "multer";
import { deletePreUser, getPreUsers, login, pregister, verifyuser, transferUser, forgotpassword, resetpassword, loginn, registerr, logOut, massverificationbyemail, register } from "../controllers/auth.js";
import { verifyToken } from "../middleware/auth.js";
import { restrict } from "../middleware/role-authorize.js";
import { checkOwnership } from "../middleware/resource-ownership.js";
import extractIP from "../middleware/getip.js";

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

const memstorage = multer.memoryStorage();
const memstore = multer({ storage: memstorage });

const router = express.Router();
// login
router.post("/login", extractIP, login);
router.post("/register", extractIP, upload.single("picture"), register);
router.post("/loginn", loginn);
router.post("/register", registerr);
// PREREGISTRATION
router.post("/pregister", pregister);
router.put("/verifyuser/:email/:valid", verifyToken, restrict('admin', 'coordinator', 'depHead'), verifyuser);
router.get("/preusers", verifyToken, restrict('admin', 'coordinator', 'depHead'), getPreUsers);
router.delete("/preusers/:email/delete", verifyToken, restrict('admin', 'coordinator', 'depHead'), deletePreUser);
router.post('/verifybyemail', verifyToken, restrict('admin', 'coordinator', 'depHead'), memstore.single('file'), massverificationbyemail)

router.post("/forgotpass", forgotpassword);
router.post("/resetpass", resetpassword);
router.post("/:id/changepass", verifyToken, checkOwnership, resetpassword);
router.post("/promote", verifyToken, restrict('admin', 'depHead'), transferUser);
router.get("/logout/:id", logOut);

export default router;
