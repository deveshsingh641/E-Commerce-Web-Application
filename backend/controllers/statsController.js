import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Get Admin Dashboard Stats via optimized MongoDB Aggregations
// @route   GET /api/stats/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueResult,
      lowStockProducts,
      recentOrders,
      categoryStats,
      orderStatusBreakdown,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Order.countDocuments(),
      // Fix BUG-04: Calculate total revenue inside MongoDB, excluding cancelled and returned orders
      Order.aggregate([
        {
          $match: {
            isPaid: true,
            status: { $nin: ['Cancelled', 'Returned'] },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' },
          },
        },
      ]),
      Product.find({ countInStock: { $lte: 5 } })
        .select('name countInStock price image category')
        .limit(6),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(6),
      Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    res.json({
      success: true,
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      lowStockProducts,
      recentOrders,
      categoryStats,
      orderStatusBreakdown,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
