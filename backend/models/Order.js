import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },
  size: { type: String },
  crust: { type: String },
  toppings: [{ type: String }],
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
});

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: Number, required: true },
  outletId: { type: String, required: true },
  outletName: { type: String, required: true },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  deliveryType: { type: String, enum: ['delivery', 'dine-in'], default: 'delivery' },
  deliveryCharge: { type: Number, required: true, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    notes: { type: String }
  },
  rider: {
    name: { type: String },
    phone: { type: String },
    assignedAt: { type: Date }
  },
  status: {
    type: String,
    enum: ['Received', 'Preparing', 'Baking', 'Ready for Pickup', 'Out for Delivery', 'Delivered'],
    default: 'Received'
  }
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);
