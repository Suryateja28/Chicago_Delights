import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Register Models first
import './models/Pizza.js';
import './models/Outlet.js';
import OrderModel from './models/Order.js';
import RiderModel from './models/Rider.js';

import { connectDB, db } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main entry point for static assets if served from backend
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Admin Authentication Middleware
const adminAuth = (req, res, next) => {
  const secret = req.headers['x-admin-secret'];
  if (secret === 'pizza123') { // Simple secret check matching frontend admin password
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized Admin Access' });
  }
};

// API Routes

// Admin routes (Protected by adminAuth)
app.get('/api/admin/orders', adminAuth, async (req, res) => {
  try {
    const orders = await db.getOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin orders', message: err.message });
  }
});

app.post('/api/admin/order-taking', adminAuth, async (req, res) => {
  try {
    const { open } = req.body;
    const status = await db.setOrderTakingOpen(open);
    res.json({ open: status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order intake status', message: err.message });
  }
});

// 1. Get all outlets
app.get('/api/outlets', async (req, res) => {
  try {
    const outlets = await db.getOutlets();
    res.json(outlets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch outlets', message: err.message });
  }
});

// 2. Get all menu items
app.get('/api/menu', async (req, res) => {
  try {
    const pizzas = await db.getPizzas();
    res.json(pizzas);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu items', message: err.message });
  }
});

// 3. Get single order details (for tracking)
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await db.getOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order', message: err.message });
  }
});

// 3.5. Get customer orders by phone
app.get('/api/orders/customer/:phone', async (req, res) => {
  try {
    const orders = await db.getCustomerOrders(req.params.phone);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer orders', message: err.message });
  }
});

// 3.6. Secure Rider Login
app.post('/api/rider/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'Phone and password are required' });

    const rider = await RiderModel.findOne({ phone: phone.trim(), password: password.trim() });
    if (!rider) return res.status(401).json({ error: 'Invalid driver credentials' });
    
    if (rider.status !== 'approved') return res.status(403).json({ error: 'Account pending admin approval' });

    res.json({ success: true, rider: { _id: rider._id, name: rider.name, phone: rider.phone, status: rider.status } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to login', message: err.message });
  }
});

// 3.7. Rider Registration
app.post('/api/rider/register', async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password) return res.status(400).json({ error: 'All fields are required' });

    const existingRider = await RiderModel.findOne({ phone: phone.trim() });
    if (existingRider) return res.status(400).json({ error: 'Phone number already registered' });

    const newRider = new RiderModel({ name: name.trim(), phone: phone.trim(), password: password.trim() });
    await newRider.save();

    res.json({ success: true, message: 'Registration successful. Waiting for admin approval.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register', message: err.message });
  }
});

// 3.8. Get Pending Riders (Admin)
app.get('/api/admin/riders', adminAuth, async (req, res) => {
  try {
    const riders = await RiderModel.find().select('-password');
    res.json(riders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch riders', message: err.message });
  }
});

// 3.9. Approve Rider (Admin)
app.post('/api/admin/riders/:id/approve', adminAuth, async (req, res) => {
  try {
    const rider = await RiderModel.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!rider) return res.status(404).json({ error: 'Rider not found' });
    res.json({ success: true, rider });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve rider', message: err.message });
  }
});

// 3.10. Restart Orders (Clear DB)
app.post('/api/admin/restart-orders', adminAuth, async (req, res) => {
  try {
    await OrderModel.deleteMany({});
    
    // Clear local fallback JSON
    const fs = await import('fs');
    const localDbPath = path.join(__dirname, 'data/local_db.json');
    if (fs.existsSync(localDbPath)) {
      const data = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
      data.orders = [];
      fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2));
    }

    res.json({ success: true, message: 'All orders have been permanently deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear orders', message: err.message });
  }
});

// 4. Assign rider and move order into out for delivery
app.post('/api/orders/:id/assign-rider', async (req, res) => {
  try {
    const { name, phone } = req.body;
    const order = await db.getOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (!name || !phone) {
      return res.status(400).json({ error: 'Rider name and phone are required' });
    }
    if (order.status === 'Delivered' || order.status === 'Out for Delivery') {
      return res.status(400).json({ error: 'Order is already out for delivery or delivered' });
    }

    const updatedOrder = await db.assignRider(req.params.id, { name, phone });
    if (!updatedOrder) {
      throw new Error('Could not assign rider');
    }
    simulateDeliveryAfterRider(req.params.id);
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign rider', message: err.message });
  }
});

// 5. Create new order and simulate progress
app.post('/api/orders', async (req, res) => {
  try {
    const {
      outletId,
      outletName,
      items,
      subtotal,
      discount,
      deliveryCharge,
      deliveryType,
      total,
      customer
    } = req.body;

    const orderTakingOpen = await db.getOrderTakingOpen();
    if (!orderTakingOpen) {
      return res.status(503).json({ error: 'Order intake is currently closed. Please try again later.' });
    }

    if (!outletId || !items || !items.length || !customer || !customer.name || !customer.phone) {
      return res.status(400).json({ error: 'Missing required order details' });
    }

    if (deliveryType === 'delivery' && (!customer.address || !customer.address.trim())) {
      return res.status(400).json({ error: 'Delivery address is required for delivery orders' });
    }

    const order = await db.createOrder({
      outletId,
      outletName,
      items,
      subtotal,
      discount,
      deliveryCharge,
      deliveryType,
      total,
      customer
    });

    // Start background simulation to advance the order status
    simulateOrderProgress(order._id || order.id);

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order', message: err.message });
  }
});

// 6. Admin endpoint to read order-taking status
app.get('/api/admin/order-taking', async (req, res) => {
  try {
    const open = await db.getOrderTakingOpen();
    res.json({ open });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order-taking status', message: err.message });
  }
});

// 9. Rider endpoint to get available and active orders
app.get('/api/rider/orders', async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ error: 'Rider phone is required' });
    }
    const orders = await db.getOrders();
    const riderOrders = orders.filter((o) => {
      if (o.status === 'Ready for Pickup') return true;
      if (o.status === 'Out for Delivery' && o.rider && o.rider.phone === phone) return true;
      return false;
    });
    res.json(riderOrders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rider orders', message: err.message });
  }
});

// Function to simulate order status changing over time
// Received -> Preparing -> Baking -> Ready for Pickup
const simulateOrderProgress = (orderId) => {
  const states = [
    { status: 'Preparing', delay: 5 * 60 * 1000 },
    { status: 'Baking', delay: 15 * 60 * 1000 },
    { status: 'Ready for Pickup', delay: 20 * 60 * 1000 }
  ];
  let currentStep = 0;

  const runNextStep = () => {
    if (currentStep >= states.length) return;
    const { status, delay } = states[currentStep];

    setTimeout(async () => {
      try {
        const updated = await db.updateOrderStatus(orderId, status);
        if (updated) {
          console.log(`[Simulated Order Update] Order ${orderId} status changed to: ${status}`);
          currentStep++;
          runNextStep();
        }
      } catch (err) {
        console.error(`[Simulation Error] Failed to update order ${orderId}:`, err.message);
      }
    }, delay);
  };

  runNextStep();
};

const simulateDeliveryAfterRider = (orderId) => {
  const delay = 15 * 60 * 1000;
  setTimeout(async () => {
    try {
      const updated = await db.updateOrderStatus(orderId, 'Delivered');
      if (updated) {
        console.log(`[Simulated Delivery] Order ${orderId} status changed to: Delivered`);
      }
    } catch (err) {
      console.error(`[Delivery Simulation Error] Failed to update order ${orderId}:`, err.message);
    }
  }, delay);
};

// Start Server
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`  🍕 Chicago Delights Server running on port ${PORT}`);
    console.log(`  📁 Database Mode: ${db.isFallback() ? 'JSON Local File Fallback' : 'MongoDB Server'}`);
    console.log(`===================================================`);
  });
};

start();
