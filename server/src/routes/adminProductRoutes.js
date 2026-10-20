import express from 'express';
import { createProduct, hideProduct, listAdminProducts, updateProduct, updateVariant } from '../controllers/adminProductController.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkPermission } from '../middleware/checkPermission.js';

const router = express.Router();
router.use(verifyToken, checkPermission('PRODUCT_MANAGE'));
router.get('/', listAdminProducts);
router.post('/', createProduct);
router.patch('/:productId', updateProduct);
router.delete('/:productId', hideProduct); // Soft delete: preserves product/order history.
router.patch('/variants/:variantId', updateVariant);

export default router;
