import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_DB_PATH = path.join(__dirname, '../data/local_db.json');
const SEED_DATA_PATH = path.join(__dirname, '../data/seedData.json');

// List of Outlets
const OUTLETS = [
  {
    id: '1',
    name: 'Chicago Delights - Uni Mall',
    address: 'Uni Mall, 5th FLOOR, LPU UNIVERSITY, PHAGWARA-144401 (PB.)',
    city: 'Phagwara',
    phone: '+91 81461-55737'
  }
];

let isConnected = false;
let useLocalFallback = false;

// Local JSON Database State (used if MongoDB connection fails)
let localData = {
  pizzas: [],
  orders: [],
  outlets: OUTLETS,
  orderTakingOpen: true
};

let orderTakingOpen = true;

// Ensure data folder exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load seed data from seedData.json for fallback
try {
  if (fs.existsSync(SEED_DATA_PATH)) {
    const rawData = fs.readFileSync(SEED_DATA_PATH, 'utf-8');
    localData.pizzas = JSON.parse(rawData);
  }
} catch (err) {
  console.error("Error loading seedData.json: ", err);
}

// Initialize Local DB file if it doesn't exist
const initializeLocalFileDB = () => {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(localData, null, 2), 'utf-8');
  } else {
    try {
      const saved = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      const parsed = JSON.parse(saved);
      localData.pizzas = parsed.pizzas || localData.pizzas;
      localData.orders = parsed.orders || [];
      localData.outlets = parsed.outlets || OUTLETS;
      localData.orderTakingOpen = parsed.orderTakingOpen != null ? parsed.orderTakingOpen : true;
      orderTakingOpen = localData.orderTakingOpen;
    } catch (err) {
      console.warn("Could not read local_db.json, recreating: ", err.message);
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(localData, null, 2), 'utf-8');
    }
  }
};

const getNextOrderNumber = async () => {
  if (isConnected && !useLocalFallback) {
    try {
      const OrderModel = mongoose.model('Order');
      const latestOrder = await OrderModel.findOne().sort({ orderNumber: -1 });
      return latestOrder ? latestOrder.orderNumber + 1 : 1;
    } catch (err) {
      console.error("MongoDB order number lookup error:", err.message);
    }
  }

  return localData.orders.reduce((max, order) => Math.max(max, order.orderNumber || 0), 0) + 1;
};

const saveLocalDB = () => {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(localData, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to write to local_db.json: ", err);
  }
};

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chicago-delights';
  console.log("Connecting to MongoDB at URI:", mongoURI);
  
  try {
    // Attempt connecting to MongoDB with a short timeout so fallback kicks in quickly if MongoDB is not running
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000, 
    });
    isConnected = true;
    console.log("🚀 Connected to MongoDB successfully!");
    
    // Seed MongoDB if it's empty
    await seedMongoDB();
  } catch (err) {
    console.warn("⚠️  MongoDB connection failed. Error:", err.message);
    console.warn("🔔 Falling back to file-based Local JSON DB!");
    useLocalFallback = true;
    initializeLocalFileDB();
  }
};

// Seed MongoDB if empty
async function seedMongoDB() {
  try {
    const PizzaModel = mongoose.model('Pizza');
    const OutletModel = mongoose.model('Outlet');
    
    const count = await PizzaModel.countDocuments();
    if (count === 0) {
      console.log("Seeding menu items into MongoDB...");
      await PizzaModel.insertMany(localData.pizzas);
      console.log("Menu items seeded successfully!");
    }
    
    const outletCount = await OutletModel.countDocuments();
    if (outletCount === 0) {
      console.log("Seeding outlets into MongoDB...");
      await OutletModel.insertMany(OUTLETS);
      console.log("Outlets seeded successfully!");
    }
  } catch (err) {
    console.error("Error seeding MongoDB:", err);
  }
}

// Unified Database CRUD Helper Operations
export const db = {
  isFallback: () => useLocalFallback,
  
  // Get Outlets
  getOutlets: async () => {
    if (isConnected && !useLocalFallback) {
      try {
        const OutletModel = mongoose.model('Outlet');
        const allOutlets = await OutletModel.find({});
        const filtered = allOutlets.filter((outlet) => {
          const name = (outlet.name || '').toLowerCase();
          const address = (outlet.address || '').toLowerCase();
          return name.includes('uni mall') || name.includes('lpu') || address.includes('uni mall') || address.includes('lpu') || address.includes('phagwara');
        });
        return filtered.length > 0 ? filtered : OUTLETS;
      } catch (err) {
        console.error("MongoDB Outlet fetch error, falling back to local:", err.message);
      }
    }
    return localData.outlets;
  },

  // Get Pizzas / Menu Items
  getPizzas: async () => {
    if (isConnected && !useLocalFallback) {
      try {
        const PizzaModel = mongoose.model('Pizza');
        const allPizzas = await PizzaModel.find({});
        return allPizzas.filter((item) => item.isVeg !== false);
      } catch (err) {
        console.error("MongoDB Pizza fetch error, falling back to local:", err.message);
      }
    }
    return localData.pizzas.filter((item) => item.isVeg !== false);
  },

  // Get Order by ID
  getOrder: async (id) => {
    if (isConnected && !useLocalFallback) {
      try {
        const OrderModel = mongoose.model('Order');
        return await OrderModel.findById(id);
      } catch (err) {
        console.error("MongoDB Order fetch error, falling back to local:", err.message);
      }
    }
    return localData.orders.find(o => o._id === id || o.id === id);
  },

  // Get All Orders
  getOrders: async () => {
    if (isConnected && !useLocalFallback) {
      try {
        const OrderModel = mongoose.model('Order');
        return await OrderModel.find({}).sort({ createdAt: -1 });
      } catch (err) {
        console.error("MongoDB Orders fetch error, falling back to local:", err.message);
      }
    }
    return [...localData.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Save Order
  createOrder: async (orderPayload) => {
    const now = new Date();
    const cleanPayload = {
      ...orderPayload,
      status: 'Received',
      createdAt: now,
      updatedAt: now
    };

    if (isConnected && !useLocalFallback) {
      try {
        const nextNumber = await getNextOrderNumber();
        const OrderModel = mongoose.model('Order');
        const newOrder = new OrderModel({ ...cleanPayload, orderNumber: nextNumber });
        return await newOrder.save();
      } catch (err) {
        console.error("MongoDB Order save error, falling back to local:", err.message);
      }
    }

    // JSON Fallback
    const localOrder = {
      _id: 'ord_' + Math.random().toString(36).substr(2, 9),
      orderNumber: await getNextOrderNumber(),
      ...cleanPayload
    };
    localData.orders.push(localOrder);
    saveLocalDB();
    return localOrder;
  },

  getOrderTakingOpen: async () => {
    return orderTakingOpen;
  },

  setOrderTakingOpen: async (open) => {
    orderTakingOpen = !!open;
    if (!isConnected || useLocalFallback) {
      localData.orderTakingOpen = orderTakingOpen;
      saveLocalDB();
    }
    return orderTakingOpen;
  },

  // Update Order Status
  updateOrderStatus: async (id, status) => {
    const now = new Date();
    if (isConnected && !useLocalFallback) {
      try {
        const OrderModel = mongoose.model('Order');
        return await OrderModel.findByIdAndUpdate(
          id, 
          { status, updatedAt: now }, 
          { new: true }
        );
      } catch (err) {
        console.error("MongoDB Order update error, falling back to local:", err.message);
      }
    }

    const orderIdx = localData.orders.findIndex(o => o._id === id || o.id === id);
    if (orderIdx !== -1) {
      localData.orders[orderIdx].status = status;
      localData.orders[orderIdx].updatedAt = now;
      saveLocalDB();
      return localData.orders[orderIdx];
    }
    return null;
  },

  assignRider: async (id, riderInfo) => {
    const now = new Date();
    if (isConnected && !useLocalFallback) {
      try {
        const OrderModel = mongoose.model('Order');
        return await OrderModel.findByIdAndUpdate(
          id,
          { 
            status: 'Out for Delivery',
            rider: { ...riderInfo, assignedAt: now },
            updatedAt: now
          },
          { new: true }
        );
      } catch (err) {
        console.error("MongoDB Rider assign error, falling back to local:", err.message);
      }
    }

    const orderIdx = localData.orders.findIndex(o => o._id === id || o.id === id);
    if (orderIdx !== -1) {
      localData.orders[orderIdx].status = 'Out for Delivery';
      localData.orders[orderIdx].rider = { ...riderInfo, assignedAt: now };
      localData.orders[orderIdx].updatedAt = now;
      saveLocalDB();
      return localData.orders[orderIdx];
    }
    return null;
  }
};
