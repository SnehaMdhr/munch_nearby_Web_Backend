import { Router } from "express";
// import admin controller
import { AdminUserController } from "../../controller/admin/user.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../../middlewares/authorized.middleware";
import { uploads } from "../../middlewares/upload.middleware";

let adminUserController = new AdminUserController();

const router = Router();

router.post("/create", authorizedMiddleware, adminOnlyMiddleware,uploads.single("imageUrl"), adminUserController.createUser);
router.put("/:id", authorizedMiddleware,adminOnlyMiddleware,uploads.single("imageUrl"), adminUserController.updateUser);

router.get("/", authorizedMiddleware, adminOnlyMiddleware, adminUserController.getAllUsers);
router.get("/:id", authorizedMiddleware, adminOnlyMiddleware, adminUserController.getOneUser);
router.delete('/:id', authorizedMiddleware, adminOnlyMiddleware, adminUserController.deleteUser);
// define admin user routes

export default router;