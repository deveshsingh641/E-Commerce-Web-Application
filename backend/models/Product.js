import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    image: {
      type: String,
      required: true,
    },
    images: [{ type: String }],
    brand: {
      type: String,
      default: 'Aura',
    },
    category: {
      type: String,
      required: true,
      enum: ['Electronics', 'Audio', 'Wearables', 'Fashion', 'Home & Living', 'Gaming'],
    },
    description: {
      type: String,
      required: true,
    },
    features: [{ type: String }],
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
    },
    rating: {
      type: Number,
      required: true,
      default: 4.5,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    badge: {
      type: String,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
