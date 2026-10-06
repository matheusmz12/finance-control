import express from 'express';
import CategoryController from "../controllers/CategoryController.js";
import authMiddleware from '../middlewares/AuthMiddlewares.js';

const router = express.Router()

router.post("/",authMiddleware, CategoryController.createCategory);
router.get("/", authMiddleware, CategoryController.getAll);
router.get("/:id",authMiddleware, CategoryController.getById);
router.put("/:id",authMiddleware, CategoryController.update)
router.delete("/:id",authMiddleware, CategoryController.delete)

export default router;