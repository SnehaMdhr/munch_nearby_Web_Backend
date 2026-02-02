import { Router } from "express";
// import admin controller
import { AdminUserController } from "../../controller/admin/user.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../../middlewares/authorized.middleware";

let adminUserController = new AdminUserController();

const router = Router();

router.get("/", authorizedMiddleware, adminOnlyMiddleware, adminUserController.getAllUsers);
router.get("/:id", authorizedMiddleware, adminOnlyMiddleware, adminUserController.getOneUser);
// define admin user routes

export default router;