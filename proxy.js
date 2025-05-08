import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get('/bike-parking', (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'data/bike-parking.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: 'File not found or unreadable' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ JSON server running on port ${PORT}`);
});
