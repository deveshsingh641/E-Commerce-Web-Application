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

  // Also create a sample order for demonstration
  const sampleUser = await User.findOne({ email: 'user@demo.com' });
  if (sampleUser && createdProducts.length >= 2) {
    const order = new Order({
      user: sampleUser._id,
      orderItems: [
        {
          product: createdProducts[0]._id,
          name: createdProducts[0].name,
          qty: 1,
          image: createdProducts[0].image,
          price: createdProducts[0].price,
        },
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
      paymentMethod: 'Credit Card (Visa **** 4242)',
      itemsPrice: createdProducts[0].price + createdProducts[1].price,
      shippingPrice: 0,
      taxPrice: Number(((createdProducts[0].price + createdProducts[1].price) * 0.08).toFixed(2)),
      discountPrice: 20.00,
      totalPrice: Number(((createdProducts[0].price + createdProducts[1].price) * 1.08 - 20).toFixed(2)),
      isPaid: true,
      paidAt: new Date(Date.now() - 3600000 * 24),
      status: 'Shipped',
      trackingNumber: 'TRK-982347102',
      timeline: [
        { title: 'Order Placed', description: 'Your order was placed successfully', completed: true, timestamp: new Date(Date.now() - 3600000 * 24) },
        { title: 'Payment Confirmed', description: 'Payment authorized and verified', completed: true, timestamp: new Date(Date.now() - 3600000 * 23) },
        { title: 'Processing & Packed', description: 'Item picked, packed, and labeled in warehouse', completed: true, timestamp: new Date(Date.now() - 3600000 * 18) },
        { title: 'Shipped & In Transit', description: 'Carrier picked up the package with tracking # TRK-982347102', completed: true, timestamp: new Date(Date.now() - 3600000 * 6) },
        { title: 'Out for Delivery', description: 'Driver is on the way to your address', completed: false },
        { title: 'Delivered', description: 'Package handed over to recipient', completed: false },
      ],
    });
    await order.save();
    console.log('Sample demo order created.');
  }

  console.log('Database successfully reset and seeded!');
};

if (process.argv[2] === '--reset') {
  resetAndSeedDatabase().then(() => process.exit());
}
