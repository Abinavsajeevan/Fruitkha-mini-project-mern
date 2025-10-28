const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  name: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    required: true, 
    enum: ["berries", "tropical fruits", "citrus fruits", "pome fruits", "stone fruits", "melons", "dry fruits", "exotic fruits"], 
    default: "tropical fruits" 
  },
  status: { type: String, required: true},
  price: { type: Number, required: true },
  stock: { type: Number, required: true, min: 0 },
  image: { type: String },
  freshness: { type: String, enum: ["Fresh", "Normal", "Rotten"], default: "Fresh" },
  origin: { type: String, default: "India" },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
