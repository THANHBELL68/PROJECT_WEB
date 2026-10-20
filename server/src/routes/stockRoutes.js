import express from 'express';
import { createStockDocument, getStockDocument, listInventory, listStockDocuments } from '../controllers/stockController.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkPermission } from '../middleware/checkPermission.js';

const router = express.Router();
router.use(verifyToken);
router.get('/inventory', checkPermission('WAREHOUSE_REPORT_VIEW'), listInventory);
router.get('/documents', checkPermission('WAREHOUSE_REPORT_VIEW'), listStockDocuments);
router.get('/documents/:documentId', checkPermission('WAREHOUSE_REPORT_VIEW'), getStockDocument);
router.post('/documents', checkPermission('STOCK_IO_MANAGE'), createStockDocument);

export default router;
