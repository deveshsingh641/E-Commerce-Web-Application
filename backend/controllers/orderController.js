import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Helper to build order timeline based on status
const createTimelineForStatus = (status) => {
  const now = new Date();
  const stages = [
    { title: 'Order Placed', description: 'Your order was placed successfully', completed: true, timestamp: now },
    { title: 'Payment Confirmed', description: 'Payment authorized and verified', completed: ['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'].includes(status), timestamp: now },
    { title: 'Processing & Packed', description: 'Item picked, packed, and labeled in warehouse', completed: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].includes(status), timestamp: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].includes(status) ? now : null },
    { title: 'Shipped & In Transit', description: 'Carrier picked up the package', completed: ['Shipped', 'Out for Delivery', 'Delivered'].includes(status), timestamp: ['Shipped', 'Out for Delivery', 'Delivered'].includes(status) ? now : null },
    { title: 'Out for Delivery', description: 'Driver is on the way to your address', completed: ['Out for Delivery', 'Delivered'].includes(status), timestamp: ['Out for Delivery', 'Delivered'].includes(status) ? now : null },
    { title: 'Delivered', description: 'Package handed over to recipient', completed: status === 'Delivered', timestamp: status === 'Delivered' ? now : null },
  ];
  return stages;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    const trackingNumber = 'TRK-' + Math.floor(100000000 + Math.random() * 900000000);
    const initialStatus = 'Confirmed';

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Credit Card',
      itemsPrice: Number(itemsPrice) || 0,
      taxPrice: Number(taxPrice) || 0,
      shippingPrice: Number(shippingPrice) || 0,
      discountPrice: Number(discountPrice) || 0,
      totalPrice: Number(totalPrice) || 0,
      isPaid: true,
      paidAt: Date.now(),
      status: initialStatus,
      trackingNumber,
      timeline: createTimelineForStatus(initialStatus),
    });

    const createdOrder = await order.save();

    // Adjust product inventory count
    for (const item of orderItems) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { countInStock: -item.qty },
        });
      }
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow admin or the owner to access
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status && status !== 'All' ? { status } : {};
    const orders = await Order.find(query).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    order.timeline = createTimelineForStatus(status);

    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
