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

-- Seed data user untuk testing dropdown assignee
INSERT INTO users (name, email, password) VALUES
('Zefanya Ecklezia Saragih', 'zefanya@example.com', '$2b$12$hashcontohbcrypt');