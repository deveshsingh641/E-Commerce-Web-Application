import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getCategories,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateObjectIdParam } from '../middleware/validateMiddleware.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = express.Router();

router.route('/')
  .get(cacheMiddleware(60), getProducts)
  .post(protect, admin, createProduct);

router.get('/meta/categories', cacheMiddleware(120), getCategories);

router.route('/:id')
  .get(validateObjectIdParam('id'), getProductById)
  .put(protect, admin, validateObjectIdParam('id'), updateProduct)
  .delete(protect, admin, validateObjectIdParam('id'), deleteProduct);

router.post('/:id/reviews', protect, validateObjectIdParam('id'), createProductReview);

export default router;
