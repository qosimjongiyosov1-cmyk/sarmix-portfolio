const express = require('express');
const path    = require('path');
const fs      = require('fs');
const cors    = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const DB_FILE = path.join(__dirname, 'videos.json');

if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch { return []; }
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Barcha videolarni olish
app.get('/api/videos', (req, res) => {
  const videos = readDB();
  res.json(videos);
});

// YouTube video qo'shish
app.post('/api/videos', (req, res) => {
  const { title = 'Video', tag = 'reels', url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL kerak' });

  // YouTube Shorts ID ni olish
  let embedUrl = url;
  const shortsMatch = url.match(/shorts\/([a-zA-Z0-9_-]+)/);
  const watchMatch  = url.match(/v=([a-zA-Z0-9_-]+)/);
  if (shortsMatch) embedUrl = `https://www.youtube.com/embed/${shortsMatch[1]}`;
  else if (watchMatch) embedUrl = `https://www.youtube.com/embed/${watchMatch[1]}`;

  const newVideo = {
    id:        Date.now().toString(),
    title:     title.trim() || 'Video',
    tag:       tag,
    url:       url,
    embedUrl:  embedUrl,
    createdAt: new Date().toISOString()
  };

  const videos = readDB();
  videos.unshift(newVideo);
  writeDB(videos);

  res.status(201).json(newVideo);
});

// Video o'chirish
app.delete('/api/videos/:id', (req, res) => {
  const videos = readDB();
  const idx    = videos.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Video topilmadi' });
  videos.splice(idx, 1);
  writeDB(videos);
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`✅ Server ishga tushdi: http://localhost:${PORT}`);
});
