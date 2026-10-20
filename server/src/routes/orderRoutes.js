import express from 'express';
import { checkout, getOrder, listOrders } from '../controllers/orderController.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkPermission } from '../middleware/checkPermission.js';

const router = express.Router();
router.use(verifyToken, checkPermission('CART_ORDER'));
router.post('/checkout', checkout);
router.get('/', listOrders);
router.get('/:orderId', getOrder);

export default router;
