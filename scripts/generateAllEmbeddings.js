// scripts/generateAllEmbeddings.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdb';

async function makeEmbedding(text) {
  // Use OpenAI embeddings endpoint
  const resp = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  // Each response has one embedding in resp.data[0].embedding
  return resp.data[0].embedding;
}

async function batchGenerate() {
  await mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const cursor = Product.find().cursor();
  let count = 0;
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    try {
      // Skip if already has embedding
      if (doc.embedding && doc.embedding.length > 0) {
        console.log(`Skipping ${doc._id} (already has embedding)`);
        continue;
      }

      // Build text: name + description (you can include other fields if desired)
      const text = `${doc.name}. ${doc.description || ''}`.trim();
      if (!text) {
        console.warn(`No textual content for product ${doc._id} - skipping`);
        continue;
      }

      const embedding = await makeEmbedding(text);
      doc.embedding = embedding;
      await doc.save();
      count++;
      console.log(`Saved embedding for ${doc._id}`);
    } catch (err) {
      console.error('Error embedding product', doc._id, err);
    }
  }

  console.log(`Done. Embeddings generated for ${count} products.`);
  await mongoose.disconnect();
}

batchGenerate().catch(err => {
  console.error(err);
  process.exit(1);
});
