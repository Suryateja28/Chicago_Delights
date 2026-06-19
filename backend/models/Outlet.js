import mongoose from 'mongoose';

const OutletSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  phone: { type: String }
});

export default mongoose.model('Outlet', OutletSchema);
