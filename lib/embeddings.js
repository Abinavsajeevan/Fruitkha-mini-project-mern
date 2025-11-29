// lib/embeddings.js
const OpenAI = require('openai');
const Product = require('../models/Product');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function makeEmbedding(text) {
  const resp = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  return resp.data[0].embedding;
}

async function ensureEmbeddingForProduct(product) {
  if (product.embedding && product.embedding.length > 0) return product.embedding;

  const text = `${product.name}. ${product.description || ''}`.trim();
  if (!text) return null;

  const embedding = await makeEmbedding(text);
  product.embedding = embedding;
  await product.save();
  return embedding;
}

module.exports = { makeEmbedding, ensureEmbeddingForProduct };
