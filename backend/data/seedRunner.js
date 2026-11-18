import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { usersSeed, productsSeed } from './seedData.js';
import { connectDB } from '../config/db.js';

export const seedDatabaseIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();

    if (userCount === 0 || productCount === 0) {
      console.log('Seeding initial demo database records...');
      if (userCount === 0) {
        for (const u of usersSeed) {
          await User.create(u);
        }
        console.log('Users seeded successfully.');
      }

      if (productCount === 0) {
        await Product.insertMany(productsSeed);
        console.log('Products seeded successfully.');
      }
    }
  } catch (error) {
    console.error('Auto seed error:', error.message);
  }
};

export const resetAndSeedDatabase = async () => {
  await connectDB();
  console.log('Clearing old collections...');
  await User.deleteMany();
  await Product.deleteMany();
  await Order.deleteMany();

  for (const u of usersSeed) {
    await User.create(u);
  }
  const createdProducts = await Product.insertMany(productsSeed);

  // Also create sample orders for demonstration
  const sampleUser = await User.findOne({ email: 'user@demo.com' });
  if (sampleUser && createdProducts.length >= 3) {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    // 1. Recently Placed Order (Confirmed - eligible for cancellation)
    const confirmedOrder = new Order({
      user: sampleUser._id,
      orderItems: [
        {
          product: createdProducts[0]._id,
          name: createdProducts[0].name,
          qty: 1,
          image: createdProducts[0].image,
          price: createdProducts[0].price,
        },
      ],
      shippingAddress: {
        fullName: sampleUser.name,
        street: '123 Market Street, Apt 4B',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98101',
        country: 'USA',
        phone: '+1 (555) 234-5678',
      },
      paymentMethod: 'Credit Card (Visa **** 4242)',
      itemsPrice: createdProducts[0].price,
      shippingPrice: 0,
      taxPrice: Number((createdProducts[0].price * 0.08).toFixed(2)),
      discountPrice: 0,
      totalPrice: Number((createdProducts[0].price * 1.08).toFixed(2)),
      isPaid: true,
      paidAt: new Date(now - 3600000 * 2),
      status: 'Confirmed',
      trackingNumber: 'TRK-109283741',
      timeline: [
        { title: 'Order Placed', description: 'Your order was placed successfully', completed: true, timestamp: new Date(now - 3600000 * 2) },
        { title: 'Payment Confirmed', description: 'Payment authorized and verified', completed: true, timestamp: new Date(now - 3600000 * 2) },
        { title: 'Processing & Packed', description: 'Item picked, packed, and labeled in warehouse', completed: false },
        { title: 'Shipped & In Transit', description: 'Carrier picked up the package', completed: false },
        { title: 'Out for Delivery', description: 'Driver is on the way to your address', completed: false },
        { title: 'Delivered', description: 'Package handed over to recipient', completed: false },
      ],
    });
    await confirmedOrder.save();

    // 2. Delivered Order (Delivered 2 days ago - eligible for 7-day return policy)
    const deliveredRecentOrder = new Order({
      user: sampleUser._id,
      orderItems: [
        {
          product: createdProducts[1]._id,
          name: createdProducts[1].name,
          qty: 1,
          image: createdProducts[1].image,
          price: createdProducts[1].price,
        },
      ],
      shippingAddress: {
        fullName: sampleUser.name,
        street: '123 Market Street, Apt 4B',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98101',
        country: 'USA',
        phone: '+1 (555) 234-5678',
      },
      paymentMethod: 'PayPal Express',
      itemsPrice: createdProducts[1].price,
      shippingPrice: 0,
      taxPrice: Number((createdProducts[1].price * 0.08).toFixed(2)),
      discountPrice: 15.00,
      totalPrice: Number((createdProducts[1].price * 1.08 - 15).toFixed(2)),
      isPaid: true,
      paidAt: new Date(now - 4 * day),
      deliveredAt: new Date(now - 2 * day),
      status: 'Delivered',
      trackingNumber: 'TRK-582910482',
      timeline: [
        { title: 'Order Placed', description: 'Your order was placed successfully', completed: true, timestamp: new Date(now - 4 * day) },
        { title: 'Payment Confirmed', description: 'Payment authorized and verified', completed: true, timestamp: new Date(now - 4 * day) },
        { title: 'Processing & Packed', description: 'Item packed in fulfillment center', completed: true, timestamp: new Date(now - 3.5 * day) },
        { title: 'Shipped & In Transit', description: 'Carrier transit underway (TRK-582910482)', completed: true, timestamp: new Date(now - 3 * day) },
        { title: 'Out for Delivery', description: 'Driver is on the way to your address', completed: true, timestamp: new Date(now - 2.2 * day) },
        { title: 'Delivered', description: 'Package handed over to recipient at front door', completed: true, timestamp: new Date(now - 2 * day) },
      ],
    });
    await deliveredRecentOrder.save();

    // 3. Delivered Order (Delivered 12 days ago - 7-day return policy expired)
    const deliveredPastOrder = new Order({
      user: sampleUser._id,
      orderItems: [
        {
          product: createdProducts[2]._id,
          name: createdProducts[2].name,
          qty: 1,
          image: createdProducts[2].image,
          price: createdProducts[2].price,
        },
      ],
      shippingAddress: {
        fullName: sampleUser.name,
        street: '123 Market Street, Apt 4B',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98101',
        country: 'USA',
        phone: '+1 (555) 234-5678',
      },
      paymentMethod: 'Credit Card (Mastercard **** 8812)',
      itemsPrice: createdProducts[2].price,
      shippingPrice: 15.00,
      taxPrice: Number((createdProducts[2].price * 0.08).toFixed(2)),
      discountPrice: 0,
      totalPrice: Number((createdProducts[2].price * 1.08 + 15).toFixed(2)),
      isPaid: true,
      paidAt: new Date(now - 16 * day),
      deliveredAt: new Date(now - 12 * day),
      status: 'Delivered',
      trackingNumber: 'TRK-392019481',
      timeline: [
        { title: 'Order Placed', description: 'Your order was placed successfully', completed: true, timestamp: new Date(now - 16 * day) },
        { title: 'Payment Confirmed', description: 'Payment authorized and verified', completed: true, timestamp: new Date(now - 16 * day) },
        { title: 'Processing & Packed', description: 'Item picked and packed', completed: true, timestamp: new Date(now - 15 * day) },
        { title: 'Shipped & In Transit', description: 'Package dispatched with tracking # TRK-392019481', completed: true, timestamp: new Date(now - 14 * day) },
        { title: 'Out for Delivery', description: 'Courier arrived in neighborhood', completed: true, timestamp: new Date(now - 12.5 * day) },
        { title: 'Delivered', description: 'Package signed and delivered', completed: true, timestamp: new Date(now - 12 * day) },
      ],
    });
    await deliveredPastOrder.save();

    console.log('Sample demo orders created.');
  }

  console.log('Database successfully reset and seeded!');
};

if (process.argv[2] === '--reset') {
  resetAndSeedDatabase().then(() => process.exit());
}
