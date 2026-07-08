# Task Management App

Aplikasi task management sederhana untuk technical test posisi Fullstack Developer Intern di PT Moonlay Technologies. Aplikasi ini memungkinkan user login, melihat daftar task, menambah, mengedit, menghapus task, mengubah status task, dan memilih assignee dari daftar user yang tersedia.

## Tech Stack

- Frontend: Next.js (React), TypeScript, Tailwind CSS
- Backend: FastAPI (Python)
- Database: PostgreSQL
- Autentikasi: JWT
- AI Chatbot: Google Gemini API (model `gemini-2.5-flash` via library `google-genai`), dengan fallback rule-based kalau API key tidak diset

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

3. Salin `.env.example` menjadi `.env`, lalu sesuaikan isinya. Tentukan dulu username, password, dan nama database yang mau dipakai di sini, karena akan dipakai lagi persis sama di langkah berikutnya

   ```
   DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/taskdb
   SECRET_KEY=ganti_dengan_random_string_panjang
   GEMINI_API_KEY=isi_sendiri
   GEMINI_MODEL=gemini-2.5-flash
   ```

   Kalau `GEMINI_API_KEY` tidak diisi, fitur chatbot tetap jalan lewat mode rule-based (dijelaskan di bagian AI Chatbot di bawah).

4. Cek/nyalakan service PostgreSQL terlebih dahulu:

   ```
   # Windows (jalankan sebagai Administrator jika perlu)
   net start postgresql-x64-<versi>

   # macOS (kalau install via Homebrew)
   brew services start postgresql

   # Linux
   sudo service postgresql start
   ```

   Setelah service aktif, buat database dan import schema. Gunakan username dan nama database yang sama dengan yang sudah kamu tulis di `DATABASE_URL` pada langkah 3 (di bawah ini contohnya pakai `postgres` dan `taskdb`, ganti kalau punyamu berbeda):

   ```
   createdb -U postgres taskdb
   psql -U postgres -d taskdb -f schema.sql
   ```

   > **Catatan:** kalau tidak menambahkan flag `-U`, `psql`/`createdb` akan otomatis memakai username OS kamu yang sedang login sebagai default, bukan username PostgreSQL yang sebenarnya. Hal ini adalah penyebab paling umum error `password authentication failed for user "..."`.

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

## AI Chatbot

Fitur chatbot ada di halaman `/tasks` yang berupa sebuah tombol di pojok kanan bawah (komponen `frontend/components/Chatbot.tsx`) dan akan membuka jendela chat ketika di-click. Setiap pesan dari user dikirim ke endpoint `POST /chatbot` di backend (`backend/app/routers/chatbot.py`), lalu backend yang memutuskan apakah akan dijawab menggunakan LLM (Gemini) atau mode rule-based.

### Library dan model yang dipakai

- **Library:** [`google-genai`](https://pypi.org/project/google-genai/) (`google.genai`), SDK resmi Python untuk Gemini API dari Google. Sudah ada di `backend/requirements.txt`.
- **Model default:** `gemini-2.5-flash`, diatur lewat environment variable `GEMINI_MODEL` di `.env` (bisa diganti ke model Gemini lain kalau perlu, tanpa perlu ubah kode).

### Cara kerja

1. **Kalau `GEMINI_API_KEY` diisi di `.env`:**
   - Backend mengambil seluruh data task dari database, lalu meringkasnya jadi teks konteks (judul, status, deadline, assignee tiap task).
   - Teks konteks itu disisipkan ke dalam _system instruction_ yang dikirim ke Gemini, bersama riwayat percakapan (maksimal 10 pesan terakhir, untuk menjaga chatbot tetap "ingat" konteks kalau user bertanya pertanyaan lanjutan seperti "itu punya siapa?").
   - Gemini diberi instruksi eksplisit untuk **menjawab hanya berdasarkan data yang dikirim** dan menjawab dalam Bahasa Indonesia, plain text tanpa format Markdown.
   - Kalau panggilan ke Gemini gagal karena server sedang sibuk (`503`/`UNAVAILABLE`/`overloaded`), backend otomatis retry sampai 3 kali dengan jeda singkat sebelum akhirnya fallback.
   - Kalau setelah retry tetap gagal (API key salah, kuota habis, dsb), backend otomatis jatuh (_fallback_) ke mode rule-based di bawah, jadi chatbot tetap bisa menjawab dan tidak menampilkan error ke user.

2. **Kalau `GEMINI_API_KEY` tidak diisi (atau LLM gagal):** backend memakai mode **rule-based**, yaitu pesan user dicocokkan ke sejumlah pola kata kunci lalu dijawab langsung dari query database, tanpa memanggil API eksternal sama sekali. Pola yang dikenali antara lain:
   - Task yang belum selesai / sedang dikerjakan (in progress) / sudah selesai (done)
   - Task yang sudah lewat deadline (terlambat/overdue)
   - Task dengan deadline hari ini / besok / minggu ini
   - Siapa assignee dari task tertentu (pencarian judul task pakai pencocokan substring, lalu overlap kata, lalu fuzzy match dengan `difflib` sebagai fallback terakhir — jadi tetap ketemu meski user tidak menulis judul task persis sama)
   - Semua task milik seorang user tertentu (dicocokkan dari nama user di database)
   - Daftar semua task
   - Kalau tidak ada pola yang cocok, chatbot membalas dengan contoh-contoh pertanyaan yang bisa diajukan.

### Cara menjalankan fitur chatbot

Tidak perlu melakukan instalasi terpisah, chatbot otomatis aktif begitu backend dan frontend jalan (lihat bagian [Menjalankan Backend](#menjalankan-backend) dan [Menjalankan Frontend](#menjalankan-frontend) di atas). Yang membedakan hanya isi `GEMINI_API_KEY` di `.env`:

- **Mau pakai mode AI (Gemini):** isi `GEMINI_API_KEY` dengan API key asli (lihat cara mendapatkannya di bagian berikutnya), lalu restart backend (`uvicorn app.main:app --reload`) supaya env var terbaca ulang.
- **Mau pakai mode rule-based saja:** biarkan `GEMINI_API_KEY` kosong di `.env`. Chatbot tetap berfungsi penuh tanpa API key sama sekali.

Setelah backend & frontend jalan, buka `http://localhost:3000/tasks`, login, lalu klik ikon chatbot di pojok kanan bawah dan coba tanyakan misalnya "Tampilkan semua task yang belum selesai" atau "Siapa assignee dari task [judul task]?".

### Cara Mendapatkan Gemini API Key

Untuk mendapatkan API Key secara gratis, ikuti langkah-langkah berikut:

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
