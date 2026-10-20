import express from "express";
import { getProducts, getProductById } from "../controllers/productController.js";

const router = express.Router();

// GET /api/products -> Lấy danh sách sản phẩm
router.get("/", getProducts);

// GET /api/products/:id -> Lấy chi tiết sản phẩm theo ID
router.get("/:id", getProductById);

export default router;