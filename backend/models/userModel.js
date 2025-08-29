import db from '../config/database.js';

export async function findUserByUsername(username) {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    return rows[0];
}

export async function createUser(username, hashedPassword) {
    await db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword]);
}