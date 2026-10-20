import express from 'express';
import { addCartItem, getCart, removeCartItem, updateCartItem } from '../controllers/cartController.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkPermission } from '../middleware/checkPermission.js';

const router = express.Router();
router.use(verifyToken, checkPermission('CART_ORDER'));
router.get('/', getCart);
router.post('/items', addCartItem);
router.patch('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeCartItem);

export default router;
