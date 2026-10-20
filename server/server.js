import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import prisma from "./src/config/prisma.js";
// import { PrismaClient } from "@prisma/client";
// // ... các import cũ ...
import productRoutes from "./src/routes/productRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import adminOrderRoutes from "./src/routes/adminOrderRoutes.js";
import stockRoutes from "./src/routes/stockRoutes.js";
import adminProductRoutes from "./src/routes/adminProductRoutes.js";

// Resolve .env from the project root, independent of the shell's working directory.
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: resolve(projectRoot, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware cơ bản
app.use(cors());
app.use(express.json());

// 1. API kiểm tra server hoạt động (Health Check)
app.get("/", (req, res) => {
  res.json({ message: "API AETHER LABS đang chạy mượt mà!" });
});

// 2. API kiểm tra kết nối Database (Thử truy vấn bảng users hoặc categories)
app.get("/api/test-db", async (req, res) => {
  try {
    // Thử đếm số lượng bản ghi trong bảng categories để kiểm tra kết nối CSDL
    const categoryCount = await prisma.categories.count();
    res.json({
      success: true,
      message: "Kết nối PostgreSQL thành công qua Prisma 7!",
      data: { categoryCount },
    });
  } catch (error) {
    console.error("Lỗi kết nối CSDL:", error);
    res.status(500).json({
      success: false,
      message: "Không thể kết nối CSDL",
      error: error.message,
    });
  }
});

// ... cấu hình middleware cũ ...

// Đăng ký các tuyến đường API (Routes)
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/stock", stockRoutes);
app.use("/api/admin/products", adminProductRoutes);

app.listen(PORT, () => {
  console.log(`Server Backend đang chạy tại cổng http://localhost:${PORT}`);
});
