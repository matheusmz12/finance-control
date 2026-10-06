import express from "express";
import UserController from "../controllers/UserController.js";
import authMiddleware from "../middlewares/AuthMiddlewares.js";

const router = express.Router();

// Só a própria conta: o id vem do token, nunca da URL.
// Cadastro de usuário é feito em POST /auth/register.
router.get("/me", authMiddleware, UserController.getMe);

router.put("/me", authMiddleware, UserController.updateMe);

router.put("/me/password", authMiddleware, UserController.updatePassword);

export default router;
