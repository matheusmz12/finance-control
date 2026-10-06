import express from "express";
import TransationController from "../controllers/TransactionController.js";
import authMiddleware from "../middlewares/AuthMiddlewares.js"

const router = express.Router();

router.post("/", authMiddleware, TransationController.create);
router.get("/", authMiddleware,TransationController.getAll);
router.get("/:id",authMiddleware, TransationController.getById);
router.put("/:id",authMiddleware, TransationController.update);
router.delete("/:id",authMiddleware, TransationController.delete)
export default router;