import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const pizzaSchema = new mongoose.Schema({}, { strict: false });
const Pizza = mongoose.model('Pizza', pizzaSchema, 'pizzas');

async function checkPizzas() {
  await mongoose.connect('mongodb://127.0.0.1:27017/chicago-delights');
  const pizzas = await Pizza.find({});
  console.log(JSON.stringify(pizzas, null, 2));
  process.exit(0);
}

checkPizzas();
