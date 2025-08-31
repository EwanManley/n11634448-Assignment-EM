const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const USERS_FILE = path.join(__dirname, 'users.json');

function readUsers() {
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, '[]');
    }

    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
}

function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function verifyLogin(username, password) {
    const users = readUsers();
    const user = users.find(u => u.username === username);
    if (user && bcrypt.compareSync(password, user.password)) {
        return user;
    }
    return null;
}

function registerUser(username, password, role) {
    const users = readUsers();

    if (users.find(u => u.username === username)) {
        return false;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = {
        id: users.length + 1,
        username,
        password: hashedPassword,
        role
    };

    users.push(newUser);
    writeUsers(users);
    return true;
}

module.exports = {
    verifyLogin,
    registerUser
};
