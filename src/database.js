const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, 'app.db'))

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL
    )
`)

module.exports = db
