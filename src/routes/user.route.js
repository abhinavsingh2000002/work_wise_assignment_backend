import {Router} from "express";
import { registerUser, loginUser, logoutUser } from "../Controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";

const router=Router();

router.route("/register").post(upload.single('file'),registerUser);
router.route("/login").post(upload.single('file'), loginUser);
router.route("/logout").post(upload.single('file'), logoutUser);


export default router;