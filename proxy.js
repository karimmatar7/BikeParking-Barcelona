import express from 'express';
import fs from 'fs';
import dotenv from 'dotenv';

const app = express();
const PORT = process.env.PORT || 3000; 

app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get('/bike-parking', (req, res) => {
  try {
    const data = fs.readFileSync('./data/bike-parking.json', 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: 'File not found or unreadable' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ JSON server running at http://localhost:${PORT}`);
});
