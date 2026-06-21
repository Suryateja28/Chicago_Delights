import mongoose from 'mongoose';

const RiderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model('Rider', RiderSchema);
