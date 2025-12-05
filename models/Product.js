const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema(
  {
  name: { type: String, required: true, trim: true },
    averageRating: { type: Number, default: 0 },        // stores 0–5
  totalReviews: { type: Number, default: 0 },
  reviews: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5, required: true },
      comment: { type: String, trim: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  category: { 
    type: String, 
    required: true, 
    enum: ["berries", "tropical fruits", "citrus fruits", "pome fruits", "stone fruits", "melons", "dry fruits", "exotic fruits"], 
    default: "tropical fruits" 
  },
  description: { type: String, trim: true },
  status: { type: String, required: true},
  price: { type: Number, required: true },
  stock: { type: Number, required: true, min: 0 },
  image: { type: String },
  gallery: [{ type: String }],
  discount: { type: String },
  origin: { type: String, default: "India" },

  embedding: { type: [Number], default: [] }

}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
