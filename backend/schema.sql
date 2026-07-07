-- Enum untuk status task
CREATE TYPE task_status AS ENUM ('Todo', 'In Progress', 'Done');

-- Tabel users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel tasks
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'Todo',
    deadline DATE,
    assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Update otomatis kolom updated_at setiap kali task di-edit
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed data users untuk testing login & dropdown assignee
-- Password plaintext (untuk login, sudah di-hash dengan bcrypt di bawah):
--   admin@example.com    -> admin123
--   zefanya@example.com  -> password123
--   budi@example.com     -> budi123
INSERT INTO users (name, email, password) VALUES
('Admin', 'admin@example.com', '$2b$12$clklz87aCEtl6fyTTSDLyuNgAveGx6Cf2VLGPBNqtqODz0Q4mZ0N2'),
('Zefanya Ecklezia Saragih', 'zefanya@example.com', '$2b$12$hRG3l2Dda2ASwxbcuGgTxOImXOWscYAqJ9J5hZXZdyOB7HYI3ergi'),
('Budi Santoso', 'budi@example.com', '$2b$12$j0zURprC7uLX2TdX9BKNkO449XfNNfTWGvtqlLMHTCZ5LdyqWS4zy');

-- Seed contoh task
INSERT INTO tasks (title, description, status, deadline, assignee_id) VALUES
('Setup project repository', 'Inisialisasi repo frontend dan backend', 'Done', CURRENT_DATE - INTERVAL '3 day', 1),
('Desain skema database', 'Rancang ERD untuk tabel users dan tasks', 'Done', CURRENT_DATE - INTERVAL '1 day', 2),
('Implementasi API CRUD task', 'Buat endpoint create, read, update, delete task', 'In Progress', CURRENT_DATE + INTERVAL '2 day', 2),
('Integrasi AI chatbot', 'Hubungkan chatbot dengan data task menggunakan Gemini', 'Todo', CURRENT_DATE + INTERVAL '5 day', 3);