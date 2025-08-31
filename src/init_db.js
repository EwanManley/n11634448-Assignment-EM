const Database = require('better-sqlite3');
const db = new Database('./src/users.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL
    );

    INSERT OR IGNORE INTO users (username, password, role)
    VALUES 
        ('admin', 'adminpass', 'admin'),
        ('user1', 'userpass', 'user');
`);

console.log('Database initialized.');
