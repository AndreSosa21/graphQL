// backend/src/queries/students.js
const db = require('../db/connection');

function getAllStudents() {
  const stmt = db.prepare('SELECT id, firstName, lastName, email, age, major FROM students');
  const rows = stmt.all();
  return rows;
}

module.exports = { getAllStudents };