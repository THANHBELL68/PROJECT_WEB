import express from 'express';
import { cancelOrder, confirmOrder, getAdminOrder, listAllOrders, updateOrderStatus } from '../controllers/adminOrderController.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkPermission } from '../middleware/checkPermission.js';

const router = express.Router();
router.use(verifyToken);
router.get('/', checkPermission('ORDER_HISTORY_ALL_VIEW'), listAllOrders);
router.get('/:orderId', checkPermission('ORDER_HISTORY_ALL_VIEW'), getAdminOrder);
router.post('/:orderId/confirm', checkPermission('ORDER_CONFIRM_CANCEL'), confirmOrder);
router.post('/:orderId/cancel', checkPermission('ORDER_CONFIRM_CANCEL'), cancelOrder);
router.patch('/:orderId/status', checkPermission('ORDER_STATUS_UPDATE'), updateOrderStatus);

export default router;
