import Product from '../models/Product.js';
import { escapeRegex, isValidObjectId } from '../middleware/validateMiddleware.js';
import { invalidateCache } from '../middleware/cacheMiddleware.js';

// @desc    Fetch all products with search, category, sort & price filter + pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      sort,
      featured,
      inStock,
      page,
      limit,
    } = req.query;

    const query = {};

    // Safely escape search keyword against ReDoS / Regex Injection
    if (keyword && keyword.trim()) {
      const sanitized = escapeRegex(keyword.trim());
      query.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { description: { $regex: sanitized, $options: 'i' } },
        { brand: { $regex: sanitized, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (inStock === 'true') {
      query.countInStock = { $gt: 0 };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    else if (sort === 'price-desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'popular') sortOption = { numReviews: -1 };

    // Support pagination when requested
    if (page || limit) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
      const skip = (pageNum - 1) * pageSize;

      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(pageSize);

      return res.json({
        products,
        page: pageNum,
        pages: Math.ceil(total / pageSize),
        total,
      });
    }

    const products = await Product.find(query).sort(sortOption);
    res.json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      originalPrice,
      description,
      image,
      images,
      brand,
      category,
      countInStock,
      badge,
      features,
      isFeatured,
    } = req.body;

    if (!name || price === undefined || !category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, category, and description are required fields',
      });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Product price must be a non-negative number',
      });
    }

    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
      '-' +
      Date.now().toString().slice(-4);

    const product = new Product({
      name: name.trim(),
      slug,
      price: numPrice,
      originalPrice: Number(originalPrice || price),
      description: description.trim(),
      image:
        image ||
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      images: Array.isArray(images) ? images : [],
      brand: brand?.trim() || 'Aura',
      category: category.trim(),
      countInStock: Math.max(0, Number(countInStock) || 0),
      badge: badge?.trim() || '',
      features: Array.isArray(features)
        ? features
        : features
        ? features.split(',').map((f) => f.trim())
        : [],
      isFeatured: Boolean(isFeatured),
    });

    const createdProduct = await product.save();
    invalidateCache('/api/products');
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const {
      name,
      price,
      originalPrice,
      description,
      image,
      images,
      brand,
      category,
      countInStock,
      badge,
      features,
      isFeatured,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (name !== undefined) product.name = name.trim();
    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        return res.status(400).json({ success: false, message: 'Price must be a valid non-negative number' });
      }
      product.price = numPrice;
    }
    if (originalPrice !== undefined) product.originalPrice = Number(originalPrice);
    if (description !== undefined) product.description = description.trim();
    if (image !== undefined) product.image = image;
    if (images !== undefined) product.images = Array.isArray(images) ? images : [];
    if (brand !== undefined) product.brand = brand.trim();
    if (category !== undefined) product.category = category.trim();
    if (countInStock !== undefined) product.countInStock = Math.max(0, Number(countInStock) || 0);
    if (badge !== undefined) product.badge = badge.trim();
    if (features !== undefined) {
      product.features = Array.isArray(features)
        ? features
        : features.split(',').map((f) => f.trim());
    }
    if (isFeatured !== undefined) product.isFeatured = Boolean(isFeatured);

    const updatedProduct = await product.save();
    invalidateCache('/api/products');
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = await Product.findById(req.params.id);
    if (product) {
      await Product.deleteOne({ _id: product._id });
      invalidateCache('/api/products');
      res.json({ success: true, message: 'Product successfully deleted' });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { rating, comment } = req.body;
    const numRating = Number(rating);

    // Data integrity validation: Prevent NaN or out-of-range rating corruption
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Review rating must be a numeric score between 1 and 5',
      });
    }

    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Review comment cannot be empty',
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }

    const review = {
      name: req.user.name,
      rating: Math.round(numRating),
      comment: comment.trim(),
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    const totalRatingSum = product.reviews.reduce((acc, item) => item.rating + acc, 0);
    product.rating = Number((totalRatingSum / product.reviews.length).toFixed(1));

    await product.save();
    invalidateCache('/api/products');
    res.status(201).json({ success: true, message: 'Review added', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get categories summary
// @route   GET /api/products/meta/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
