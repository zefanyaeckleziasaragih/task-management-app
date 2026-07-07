# Task Management App

Aplikasi task management sederhana untuk technical test posisi Fullstack Developer Intern di PT Moonlay Technologies. Aplikasi ini memungkinkan user login, melihat daftar task, menambah, mengedit, menghapus task, mengubah status task, dan memilih assignee dari daftar user yang tersedia.

## Tech Stack

- Frontend: Next.js (React), TypeScript, Tailwind CSS
- Backend: FastAPI (Python)
- Database: PostgreSQL
- Autentikasi: JWT
- AI Chatbot: Google Gemini API, dengan fallback rule-based kalau API key tidak diset

## Struktur Folder

```
task-management-app/
├── backend/
│   ├── app/
│   │   ├── auth.py          -> login & JWT
│   │   ├── database.py      -> koneksi SQLAlchemy ke PostgreSQL
│   │   ├── models.py        -> model User & Task
│   │   ├── schemas.py       -> Pydantic schema request/response
│   │   ├── main.py          -> entry point FastAPI
│   │   └── routers/
│   │       ├── tasks.py     -> CRUD task
│   │       ├── users.py     -> daftar user (untuk dropdown assignee)
│   │       └── chatbot.py   -> AI chatbot
│   ├── schema.sql           -> DDL + seed data
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── login/           -> halaman login
│   │   └── tasks/           -> halaman daftar & kelola task
│   ├── components/          -> TaskCard, TaskModal, Chatbot
│   └── lib/                 -> api client, types
└── README.md
```

## Menjalankan Backend

1. Masuk ke folder backend

   ```
   cd backend
   ```

2. Buat virtual environment lalu install dependency

   ```
   python -m venv venv
   source venv/bin/activate      (Windows: venv\Scripts\activate)
   pip install -r requirements.txt
   ```

3. Siapkan database PostgreSQL, lalu jalankan schema.sql untuk membuat tabel dan seed data

   ```
   createdb taskdb
   psql -d taskdb -f schema.sql
   ```

4. Salin `.env.example` menjadi `.env`, lalu sesuaikan isinya

   ```
   DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/taskdb
   SECRET_KEY=ganti_dengan_random_string_panjang
   GEMINI_API_KEY=isi_sendiri
   GEMINI_MODEL=gemini-2.5-flash
   ```

   Kalau `GEMINI_API_KEY` tidak diisi, fitur chatbot tetap jalan lewat mode rule-based (dijelaskan di bagian AI Chatbot di bawah).

5. Jalankan server

   ```
   uvicorn app.main:app --reload
   ```

   Backend akan berjalan di `http://localhost:8000`. Dokumentasi Swagger otomatis tersedia di `http://localhost:8000/docs`.

## Menjalankan Frontend

1. Masuk ke folder frontend

   ```
   cd frontend
   ```

2. Install dependency

   ```
   npm install
   ```

3. Buat file `.env.local` untuk menunjuk ke alamat backend

   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Jalankan development server

   ```
   npm run dev
   ```

   Frontend akan berjalan di `http://localhost:3000`.

## Akun untuk Login

Sudah tersedia 3 akun dari seed data di schema.sql, bisa langsung dipakai untuk login (di halaman login juga ada tombol isi otomatis untuk masing-masing akun ini):

| Email               | Password    | Nama                     |
| ------------------- | ----------- | ------------------------ |
| admin@example.com   | admin123    | Admin                    |
| zefanya@example.com | password123 | Zefanya Ecklezia Saragih |
| budi@example.com    | budi123     | Budi Santoso             |

## Cara Mendapatkan Gemini API Key

Fitur chatbot pada aplikasi ini menggunakan model Gemini dari Google. Untuk mendapatkan API Key secara gratis, ikuti langkah-langkah berikut:

1. Buka halaman [Google AI Studio](https://aistudio.google.com/).
2. Login menggunakan akun Google Anda.
3. Klik tombol **"Get API key"** yang berada di pojok kiri atas atau di panel utama.
4. Klik **"Create API key"**.
5. Pilih opsi **"Create API key in new project"** (atau pilih project Google Cloud yang sudah ada jika ada).
6. Tunggu proses pembuatan selesai, lalu salin (copy) string API Key yang muncul.
7. Tempel (paste) kunci tersebut ke dalam file `.env` di bagian `GEMINI_API_KEY`.

> **Catatan:** Google menyediakan kuota gratis (_Free Tier_) yang sudah lebih dari cukup untuk kebutuhan technical test ini.

## Catatan / Asumsi

- Login memakai email dan password asli yang tersimpan (di-hash dengan bcrypt) di database, bukan hardcode di sisi frontend, supaya autentikasi JWT-nya benar-benar berjalan sesuai ketentuan teknis.
- Update task bersifat partial (PATCH-like lewat PUT), jadi frontend cukup mengirim field yang berubah saja, misalnya saat drag status atau ganti assignee dari dropdown.
- Assignee bersifat opsional (nullable), task tetap bisa dibuat tanpa assignee lalu diisi belakangan.
