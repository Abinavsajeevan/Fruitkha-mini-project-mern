// lib/embeddings.js
const OpenAI = require('openai');
const Product = require('../models/Product');
const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

async function makeEmbedding(text) {
  if (!client) {
    // Free tier / dev fallback: generate a mock embedding
    return Array(1536).fill(0).map(() => Math.random());
  }

  try {
    const resp = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });
    return resp.data[0].embedding;
  } catch (err) {
    console.warn('Embedding failed, using fallback:', err.message);
    return Array(1536).fill(0).map(() => Math.random());
  }
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
