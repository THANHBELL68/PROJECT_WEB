// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
// ✅ THAY BẰNG dòng import từ file config trung tâm (chú ý đường dẫn tương đối từ thư mục controllers ra config):
import prisma from "../config/prisma.js";
// Lấy danh sách sản phẩm (có hỗ trợ lọc theo danh mục, phân trang cơ bản)
export const getProducts = async (req, res) => {
  try {
    const { categoryId, search } = req.query;

    // Xây dựng điều kiện lọc động
    const whereCondition = {
      is_visible: true,
      deleted_at: null,
    };

    if (categoryId) {
      whereCondition.category_id = parseInt(categoryId);
    }

    if (search) {
      whereCondition.name = {
        contains: search,
        mode: "insensitive", // Không phân biệt hoa thường
      };
    }

    const products = await prisma.products.findMany({
      where: whereCondition,
      include: {
        categories: true,       // Lấy kèm thông tin danh mục
        product_variants: {     // Lấy kèm các biến thể (size, màu, giá)
          where: { is_active: true },
        },
        product_images: true,   // Lấy kèm hình ảnh sản phẩm
      },
      orderBy: { created_at: "desc" },
    });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách sản phẩm:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy sản phẩm" });
  }
};

// Lấy chi tiết 1 sản phẩm theo ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.products.findUnique({
      where: { id: parseInt(id) },
      include: {
        categories: true,
        product_variants: {
          include: {
            sizes: true,
            colors: true,
            materials: true,
          },
        },
        product_images: true,
      },
    });

    if (!product || product.deleted_at || product.is_visible === false) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Lỗi lấy chi tiết sản phẩm:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy chi tiết sản phẩm" });
  }
};
