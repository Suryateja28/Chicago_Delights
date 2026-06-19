import mongoose from 'mongoose';

const PizzaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  image: { type: String },
  isVeg: { type: Boolean, default: true },
  spicyLevel: { type: Number, default: 0 },
  isBestSeller: { type: Boolean, default: false },
  basePrices: {
    type: Map,
    of: Number
  },
  price: { type: Number },
  customizable: { type: Boolean, default: false }
});

export default mongoose.model('Pizza', PizzaSchema);
