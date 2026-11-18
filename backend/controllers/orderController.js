import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { isValidObjectId } from '../middleware/validateMiddleware.js';

// Helper to build order timeline based on status
const createTimelineForStatus = (status, order = {}) => {
  const now = new Date();

  if (status === 'Cancelled') {
    return [
      {
        title: 'Order Placed',
        description: 'Your order was placed successfully',
        completed: true,
        timestamp: order.createdAt || now,
      },
      {
        title: 'Payment Confirmed',
        description: 'Payment authorized and verified',
        completed: true,
        timestamp: order.paidAt || now,
      },
      {
        title: 'Order Cancelled',
        description: order.cancelReason
          ? `Order cancelled (${order.cancelReason}). Stock returned to inventory.`
          : 'Order cancelled by customer. Stock returned to inventory.',
        completed: true,
        timestamp: order.cancelledAt || now,
      },
    ];
  }

  const stages = [
    {
      title: 'Order Placed',
      description: 'Your order was placed successfully',
      completed: true,
      timestamp: order.createdAt || now,
    },
    {
      title: 'Payment Confirmed',
      description: 'Payment authorized and verified',
      completed: [
        'Confirmed',
        'Processing',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Return Requested',
        'Returned',
      ].includes(status),
      timestamp: order.paidAt || now,
    },
    {
      title: 'Processing & Packed',
      description: 'Item picked, packed, and labeled in warehouse',
      completed: [
        'Processing',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Return Requested',
        'Returned',
      ].includes(status),
      timestamp: [
        'Processing',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Return Requested',
        'Returned',
      ].includes(status)
        ? order.updatedAt || now
        : null,
    },
    {
      title: 'Shipped & In Transit',
      description: order.trackingNumber
        ? `Carrier transit underway (${order.trackingNumber})`
        : 'Carrier picked up the package',
      completed: [
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Return Requested',
        'Returned',
      ].includes(status),
      timestamp: [
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Return Requested',
        'Returned',
      ].includes(status)
        ? order.updatedAt || now
        : null,
    },
    {
      title: 'Out for Delivery',
      description: 'Driver is on the way to your address',
      completed: ['Out for Delivery', 'Delivered', 'Return Requested', 'Returned'].includes(status),
      timestamp: ['Out for Delivery', 'Delivered', 'Return Requested', 'Returned'].includes(status)
        ? order.updatedAt || now
        : null,
    },
    {
      title: 'Delivered',
      description: 'Package handed over to recipient',
      completed: ['Delivered', 'Return Requested', 'Returned'].includes(status),
      timestamp: order.deliveredAt || (status === 'Delivered' ? now : null),
    },
  ];

  if (status === 'Return Requested') {
    stages.push({
      title: 'Return Requested (7-Day Policy)',
      description: `Return initiated: "${order.returnReason || 'Customer requested return'}". Resolution: ${
        order.returnType || 'Refund to Original Payment'
      }.`,
      completed: true,
      timestamp: order.returnRequestedAt || now,
    });
  } else if (status === 'Returned') {
    stages.push({
      title: 'Return Requested (7-Day Policy)',
      description: `Return request submitted: "${order.returnReason || 'Customer return'}".`,
      completed: true,
      timestamp: order.returnRequestedAt || now,
    });
    stages.push({
      title: 'Item Returned & Refund Processed',
      description: 'Package received by return center. Refund / credit processed.',
      completed: true,
      timestamp: order.returnedAt || now,
    });
  }

  return stages;
};

// @desc    Create new order with server-side pricing & inventory verification
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items provided' });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.postalCode
    ) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required (fullName, street, city, postalCode)',
      });
    }

    // Server-side verification of products, stock availability, and prices
    const verifiedOrderItems = [];
    let calculatedItemsPrice = 0;

    for (const item of orderItems) {
      const qty = parseInt(item.qty, 10);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for item ${item.name || 'in cart'}`,
        });
      }

      const productId = item.product || item._id;
      if (!isValidObjectId(productId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product ID reference: ${productId}`,
        });
      }

      const dbProduct = await Product.findById(productId);
      if (!dbProduct) {
        return res.status(404).json({
          success: false,
          message: `Product "${item.name || productId}" no longer exists in our catalog`,
        });
      }

      // Check stock availability
      if (dbProduct.countInStock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for "${dbProduct.name}". Requested: ${qty}, Available: ${dbProduct.countInStock}`,
        });
      }

      const itemTotal = Number((dbProduct.price * qty).toFixed(2));
      calculatedItemsPrice += itemTotal;

      verifiedOrderItems.push({
        product: dbProduct._id,
        name: dbProduct.name,
        qty,
        image: dbProduct.image,
        price: dbProduct.price,
      });
    }

    calculatedItemsPrice = Number(calculatedItemsPrice.toFixed(2));

    // Shipping rules: Free shipping over $150, else $15
    let shippingPrice = calculatedItemsPrice > 150 || calculatedItemsPrice === 0 ? 0 : 15;

    // Coupon discount verification server-side
    let discountPrice = 0;
    const cleanCoupon = (couponCode || '').trim().toUpperCase();
    if (cleanCoupon === 'SAVE20') {
      discountPrice = Math.min(20, calculatedItemsPrice);
    } else if (cleanCoupon === 'WELCOME10') {
      discountPrice = Number((calculatedItemsPrice * 0.1).toFixed(2));
    } else if (cleanCoupon === 'FREESHIP') {
      shippingPrice = 0;
      discountPrice = 15;
    }

    const taxPrice = Number((calculatedItemsPrice * 0.08).toFixed(2));
    const totalPrice = Number(
      Math.max(0, calculatedItemsPrice + shippingPrice + taxPrice - discountPrice).toFixed(2)
    );

    const trackingNumber = 'TRK-' + Math.floor(100000000 + Math.random() * 900000000);
    const initialStatus = 'Confirmed';

    const order = new Order({
      user: req.user._id,
      orderItems: verifiedOrderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        street: shippingAddress.street.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state?.trim() || '',
        postalCode: shippingAddress.postalCode.trim(),
        country: shippingAddress.country?.trim() || 'USA',
        phone: shippingAddress.phone?.trim() || '',
      },
      paymentMethod: paymentMethod || 'Credit Card',
      itemsPrice: calculatedItemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice,
      totalPrice,
      isPaid: true,
      paidAt: Date.now(),
      status: initialStatus,
      trackingNumber,
      timeline: createTimelineForStatus(initialStatus),
    });

    const createdOrder = await order.save();

    // Atomically decrement stock in inventory
    for (const item of verifiedOrderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { countInStock: -item.qty },
      });
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only allow admin or the owner to access
    const isOwner = order.user && (order.user._id?.toString() === req.user._id.toString() || order.user.toString() === req.user._id.toString());
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order (Customer / Admin)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization check
    const isOwner = order.user.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    // Status check
    if (order.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'This order is already cancelled' });
    }

    if (['Shipped', 'Out for Delivery', 'Delivered', 'Return Requested', 'Returned'].includes(order.status) && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Orders in transit or delivered cannot be cancelled online. Please use the 7-Day Return option upon delivery.',
      });
    }

    // Set cancellation details
    order.status = 'Cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || 'Customer requested cancellation';
    order.timeline = createTimelineForStatus('Cancelled', order);

    const updatedOrder = await order.save();

    // Restock product inventory
    for (const item of order.orderItems) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { countInStock: item.qty },
        });
      }
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Return delivered order within 7 days (Customer / Admin)
// @route   PUT /api/orders/:id/return
// @access  Private
export const returnOrder = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization check
    const isOwner = order.user.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to return this order' });
    }

    // Must be Delivered to be returned
    if (order.status !== 'Delivered') {
      if (['Return Requested', 'Returned'].includes(order.status)) {
        return res.status(400).json({ success: false, message: 'A return has already been requested for this order' });
      }
      return res.status(400).json({ success: false, message: 'Only delivered orders are eligible for return' });
    }

    // 7-day policy validation
    const deliveryDate = order.deliveredAt || order.updatedAt || order.createdAt;
    const diffMs = Date.now() - new Date(deliveryDate).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays > 7) {
      return res.status(400).json({
        success: false,
        message: `Return policy window expired. Returns are only accepted within 7 days of delivery (Delivered ${Math.floor(
          diffDays
        )} days ago).`,
      });
    }

    const { reason, returnType, comments } = req.body;

    order.status = 'Return Requested';
    order.returnRequestedAt = new Date();
    order.returnReason = reason || 'Customer requested return';
    if (returnType) {
      order.returnType = returnType;
    }
    order.returnComments = comments || '';
    order.timeline = createTimelineForStatus('Return Requested', order);

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const oldStatus = order.status;
    order.status = status;

    if (status === 'Delivered' && !order.deliveredAt) {
      order.deliveredAt = Date.now();
    } else if (status === 'Returned' && !order.returnedAt) {
      order.returnedAt = Date.now();
      // If marked returned, restock inventory if not already restocked
      if (oldStatus !== 'Returned') {
        for (const item of order.orderItems) {
          if (item.product) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { countInStock: item.qty },
            });
          }
        }
      }
    } else if (status === 'Cancelled' && !order.cancelledAt) {
      order.cancelledAt = Date.now();
      // If admin marks cancelled and was not cancelled before, restock inventory
      if (oldStatus !== 'Cancelled') {
        for (const item of order.orderItems) {
          if (item.product) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { countInStock: item.qty },
            });
          }
        }
      }
    }

    order.timeline = createTimelineForStatus(status, order);

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
