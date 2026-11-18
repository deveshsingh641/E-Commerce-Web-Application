import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('Launching Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  try {
    // ----------------------------------------------------
    // MODULE 1: Storefront / Catalog
    // ----------------------------------------------------
    console.log('Capturing 01_catalog_storefront.png...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await sleep(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '01_catalog_storefront.png'),
    });

    // ----------------------------------------------------
    // MODULE 2: Product Detail Page
    // ----------------------------------------------------
    console.log('Capturing 02_product_detail_page.png...');
    // Click on the first product card title h3
    await page.evaluate(() => {
      const heading = document.querySelector('h3.cursor-pointer');
      if (heading) heading.click();
    });
    await sleep(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '02_product_detail_page.png'),
    });

    // ----------------------------------------------------
    // MODULE 3: Cart Drawer Slide-Over (with item inside!)
    // ----------------------------------------------------
    console.log('Capturing 03_cart_drawer_slideover.png...');
    // Click "Add to Cart" button on Product Detail Page
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find((b) => b.textContent.includes('Add to Cart'));
      if (addBtn) addBtn.click();
    });
    await sleep(1000);
    // Open Cart Drawer via Cart icon button
    await page.evaluate(() => {
      const cartBtn = document.querySelector('button[aria-label="Shopping Cart"]');
      if (cartBtn) cartBtn.click();
    });
    await sleep(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '03_cart_drawer_slideover.png'),
    });

    // ----------------------------------------------------
    // MODULE 4: Checkout - Step 1: Shipping Address
    // ----------------------------------------------------
    console.log('Capturing 04_checkout_shipping_details.png...');
    // Click "Checkout" button inside Cart Drawer
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const checkoutBtn = buttons.find((b) => b.textContent.trim().startsWith('Checkout'));
      if (checkoutBtn) checkoutBtn.click();
    });
    await sleep(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '04_checkout_shipping_details.png'),
    });

    // ----------------------------------------------------
    // MODULE 5: Checkout - Step 2: Payment Options
    // ----------------------------------------------------
    console.log('Capturing 05_checkout_payment_methods.png...');
    // Click "Continue to Payment" button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const payBtn = buttons.find((b) => b.textContent.includes('Continue to Payment'));
      if (payBtn) payBtn.click();
    });
    await sleep(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '05_checkout_payment_methods.png'),
    });

    // ----------------------------------------------------
    // MODULE 6: Order Placed Success Confirmation
    // ----------------------------------------------------
    console.log('Capturing 06_order_confirmation_success.png...');
    // Click "Pay $" button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const placeBtn = buttons.find((b) => b.textContent.includes('Pay $'));
      if (placeBtn) placeBtn.click();
    });
    await sleep(3000); // allow confetti and confirmation render
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '06_order_confirmation_success.png'),
    });

    // ----------------------------------------------------
    // MODULE 7: Order Tracking Timeline
    // ----------------------------------------------------
    console.log('Capturing 07_order_tracking_timeline.png...');
    // Click "Track Live Order Status" button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const trackBtn = buttons.find((b) => b.textContent.includes('Track Live Order'));
      if (trackBtn) trackBtn.click();
    });
    await sleep(2500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '07_order_tracking_timeline.png'),
    });

    // ----------------------------------------------------
    // MODULE 8: Authentication Portal (Login / Register)
    // ----------------------------------------------------
    console.log('Capturing 08_authentication_portal.png...');
    // Clear user state from localStorage and navigate to auth
    await page.evaluate(() => {
      localStorage.removeItem('aura_user');
      window.location.reload();
    });
    await sleep(2000);
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const signBtn = buttons.find((b) => b.textContent.includes('Sign In'));
      if (signBtn) signBtn.click();
    });
    await sleep(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '08_authentication_portal.png'),
    });

    // ----------------------------------------------------
    // MODULE 9: Admin Dashboard - Analytics Overview
    // ----------------------------------------------------
    console.log('Capturing 09_admin_analytics_overview.png...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const adminBtn = buttons.find((b) => b.textContent.includes('Demo Admin'));
      if (adminBtn) adminBtn.click();
    });
    await sleep(2500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '09_admin_analytics_overview.png'),
    });

    // ----------------------------------------------------
    // MODULE 10: Admin Dashboard - Products Catalog Management
    // ----------------------------------------------------
    console.log('Capturing 10_admin_products_management.png...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const prodTab = buttons.find((b) => b.textContent.includes('Product Catalog'));
      if (prodTab) prodTab.click();
    });
    await sleep(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '10_admin_products_management.png'),
    });

    // ----------------------------------------------------
    // MODULE 11: Admin Add New Product Modal
    // ----------------------------------------------------
    console.log('Capturing 11_admin_add_product_modal.png...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find((b) => b.textContent.includes('Add New Product'));
      if (addBtn) addBtn.click();
    });
    await sleep(1200);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '11_admin_add_product_modal.png'),
    });

    // Close modal
    await page.evaluate(() => {
      const closeButtons = Array.from(document.querySelectorAll('button'));
      const xBtn = closeButtons.find(
        (b) => b.querySelector('svg.lucide-x') || b.textContent.includes('Cancel')
      );
      if (xBtn) xBtn.click();
    });
    await sleep(600);

    // ----------------------------------------------------
    // MODULE 12: Admin Dashboard - Orders Fulfillment Pipeline
    // ----------------------------------------------------
    console.log('Capturing 12_admin_orders_management.png...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const ordersTab = buttons.find((b) => b.textContent.includes('Orders Fulfillment'));
      if (ordersTab) ordersTab.click();
    });
    await sleep(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '12_admin_orders_management.png'),
    });

    console.log('All screenshots completed successfully!');
  } catch (err) {
    console.error('Screenshot capture error:', err);
  } finally {
    await browser.close();
  }
}

run();
