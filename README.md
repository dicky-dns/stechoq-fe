# Stechoq Tracker Frontend

Frontend Next.js untuk Stechoq Tracker (Laravel API).

## Fitur
- Login + penyimpanan token di browser
- Dashboard ringkasan project dan issue
- Project list (table) + modal tambah/edit
- Issue per project + modal tambah + modal update assignee
- Report issues berdasarkan project + filter assignee/type/status
- UI light Tailwind + toast error di pojok kanan atas

## Prasyarat
- Node.js 18+
- Backend `stechoq-tracker` sudah jalan (default: http://localhost:8001)

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
Buat file `.env.local`:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001/api
```

## Akun Demo (Seeder Backend)
- Manager: `manager1@example.com` / `password`
- Engineer: `engineer1@example.com` / `password`

## Halaman Utama
- `/login` - login
- `/dashboard` - ringkasan
- `/projects` - list project (akses issue dari sini)
- `/projects/:id/issues` - issue per project
- `/reports` - report issues per project dengan filter

## Catatan
- Issue hanya bisa diakses melalui list project.
- Manager membuat issue tanpa status (default backend) dan bisa assign assignee.
- Update issue hanya untuk assignee (manager).
