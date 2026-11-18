import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  returnOrder,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateObjectIdParam } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrder)
  .get(protect, admin, getAllOrders);

router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, validateObjectIdParam('id'), getOrderById);
router.put('/:id/status', protect, admin, validateObjectIdParam('id'), updateOrderStatus);
router.put('/:id/cancel', protect, validateObjectIdParam('id'), cancelOrder);
router.put('/:id/return', protect, validateObjectIdParam('id'), returnOrder);

export default router;
