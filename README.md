# Stechoq Tracker Frontend

Frontend Next.js untuk Stechoq Tracker (Laravel API).

## Fitur
- Login + penyimpanan token di browser
- Dashboard ringkasan project dan issue
- Project list + fitur tambah/edit
- List Issue per project + fitur tambah/edit sesuai role
- Report issues berdasarkan project
- UI style dengan Tailwind

## Prasyarat
- Node.js 18+
- Backend sudah jalan (default: http://localhost:8001)

## Setup
```bash
npm install
```

## Menjalankan
```bash
npm run dev
```
App berjalan di `http://localhost:3000`.

## Environment
Buat file `.env`:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001/api
```

## Akun Demo
- Manager: `manager1@example.com` / `password`
- Engineer: `engineer1@example.com` / `password`

## Halaman Utama
- `/login` - login
- `/dashboard` - ringkasan
- `/projects` - list project (akses issue dari sini)
- `/projects/:id/issues` - issue per project
- `/reports` - report issues per project dengan filter

