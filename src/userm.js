const db = require('better-sqlite3')('./src/users.db')

function verifyLogin(username, password) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?')
    return stmt.get(username, password)
}

module.exports = {
    verifyLogin
}
