# Frontend — Mood Detector

React + TypeScript + Vite

## Cara Menjalankan

```bash
# 1. Install dependencies
npm install

# 2. Jalankan development server
npm run dev
```

Buka browser: `http://localhost:5173`

> Pastikan backend sudah berjalan di port 5000 sebelum menjalankan frontend.
> Proxy ke backend sudah dikonfigurasi otomatis di `vite.config.ts`.

## Build untuk Production

```bash
npm run build
```

Output ada di folder `dist/` — bisa di-deploy ke Vercel atau Netlify.

## Struktur Halaman

| Halaman | URL | Auth |
|---------|-----|------|
| Landing | `/` | - |
| Login | `/login` | - |
| Register | `/register` | - |
| Dashboard | `/dashboard` | ✅ |
| Detection | `/detection` | ✅ |
| Upload | `/upload` | ✅ |
| History | `/history` | ✅ |
| Dashboard Stats | `/dashboard` | ✅ |