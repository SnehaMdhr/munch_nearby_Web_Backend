import { Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { uploads } from "../middlewares/upload.middleware";

let authController = new AuthController();
const router = Router();

router.post("/register", authController.register)
router.post("/login",authController.login)
router.get("/whoami", authorizedMiddleware, authController.getUserById);
router.put("/update-profile", authorizedMiddleware,uploads.single("image"),authController.updateUser);

export default router;