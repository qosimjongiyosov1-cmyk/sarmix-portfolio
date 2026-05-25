# Sarmix Portfolio — Backend

## Loyiha tuzilmasi

```
sarmix-backend/
├── server.js          ← Asosiy server (Express)
├── package.json
├── railway.toml       ← Railway deploy sozlamasi
├── public/
│   └── index.html     ← Sayt (shu yerdan ko'rsatiladi)
└── uploads/           ← Videolar shu papkada saqlanadi
```

## Lokal ishga tushirish

```bash
# 1. Papkaga kirish
cd sarmix-backend

# 2. Paketlarni o'rnatish
npm install

# 3. Serverni ishga tushirish
npm start
```

Brauzerda oching: http://localhost:3000

---

## Railway ga deploy qilish (BEPUL)

### 1-qadam — GitHub ga yuklash

```bash
git init
git add .
git commit -m "first commit"
```

GitHub.com ga kiring → New repository yarating → papkani push qiling:
```bash
git remote add origin https://github.com/SIZNING_USERNAME/sarmix-backend.git
git push -u origin main
```

### 2-qadam — Railway ga ulash

1. **railway.app** ga kiring (GitHub bilan kirish)
2. **"New Project"** tugmasini bosing
3. **"Deploy from GitHub repo"** tanlang
4. Siz yaratgan repozitoriyani tanlang
5. Tayyor! Railway avtomatik deploy qiladi ✅

### 3-qadam — URL olish

Deploy bo'lgach Railway sizga domen beradi:
`https://sarmix-backend-production.up.railway.app`

Mana shu URL — bu sizning saytingiz!

---

## API Endpointlar

| Method | URL | Vazifa |
|--------|-----|--------|
| GET | /api/videos | Barcha videolarni olish |
| POST | /api/videos | Yangi video yuklash (form-data: video, title, tag) |
| DELETE | /api/videos/:id | Video o'chirish |

## Video formatlari

- MP4, WebM, MOV, AVI
- Maksimum hajm: **500 MB**
- Kategoriyalar: `reels`, `speedramp`, `motion`
