const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('MONGODB_URI environment variable is required');
  process.exit(1);
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => { console.error('MongoDB connection error', err); process.exit(1); });

const pageSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: String,
  content: String
}, { timestamps: true });

const Page = mongoose.model('Page', pageSchema);

app.use(express.json());
app.use(express.static('.'));

// Public read-only endpoint for the About page
app.get('/api/about', async (req, res) => {
  try {
    const page = await Page.findOne({ slug: 'about' }).lean();
    if (page) return res.json({ ok: true, page });
    // fallback content when DB doesn't have the doc yet
    return res.json({ ok: true, page: { title: 'About', content: 'Potporli was born out of a desire to redefine how web platforms are built.' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'server error' });
  }
});

// Protected endpoint to upsert pages (requires ADMIN_API_KEY header)
app.post('/api/pages', async (req, res) => {
  const key = req.headers['x-api-key'];
  if (!process.env.ADMIN_API_KEY || key !== process.env.ADMIN_API_KEY) return res.status(401).json({ ok: false, error: 'unauthorized' });
  const { slug, title, content } = req.body;
  if (!slug) return res.status(400).json({ ok: false, error: 'slug required' });
  try {
    const doc = await Page.findOneAndUpdate({ slug }, { slug, title, content }, { upsert: true, new: true });
    res.json({ ok: true, doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
});

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
