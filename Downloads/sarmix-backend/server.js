const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const cors    = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Papkalar ──────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DB_FILE     = path.join(__dirname, 'videos.json');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(DB_FILE))     fs.writeFileSync(DB_FILE, '[]');

// ── Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Statik fayllar — HTML sayt va yuklangan videolar
app.use(express.static(path.join(__dirname, 'public')));
app.use('/videos', express.static(UPLOADS_DIR));

// ── DB yordamchi funksiyalar ──────────────────────────────
function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch { return []; }
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ── Multer — video saqlash sozlamasi ─────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext    = path.extname(file.originalname);
    cb(null, unique + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Faqat video fayl qabul qilinadi (mp4, webm, mov, avi)'));
  }
});

// ── API: barcha videolarni olish ─────────────────────────
app.get('/api/videos', (req, res) => {
  const videos = readDB();
  res.json(videos);
});

// ── API: video yuklash ───────────────────────────────────
app.post('/api/videos', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Fayl yuklanmadi' });

  const { title = 'Video', tag = 'reels' } = req.body;
  const allowedTags = ['reels', 'speedramp', 'motion'];

  const newVideo = {
    id:        Date.now().toString(),
    title:     title.trim() || 'Video',
    tag:       allowedTags.includes(tag) ? tag : 'reels',
    filename:  req.file.filename,
    url:       `/videos/${req.file.filename}`,
    size:      req.file.size,
    createdAt: new Date().toISOString()
  };

  const videos = readDB();
  videos.unshift(newVideo); // yangi video yuqorida bo'lsin
  writeDB(videos);

  res.status(201).json(newVideo);
});

// ── API: video o'chirish ─────────────────────────────────
app.delete('/api/videos/:id', (req, res) => {
  const videos   = readDB();
  const idx      = videos.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Video topilmadi' });

  const [removed] = videos.splice(idx, 1);

  // Diskdan ham o'chirish
  const filePath = path.join(UPLOADS_DIR, removed.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  writeDB(videos);
  res.json({ success: true });
});

// ── Barcha boshqa so'rovlar → index.html ─────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Error handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`✅ Server ishga tushdi: http://localhost:${PORT}`);
});
