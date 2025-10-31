// backend/src/db/init.js
const db = require('./connection');

function init() {
  // Crear tabla students
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      age INTEGER,
      major TEXT
    );
  `);

  // Revisar si hay filas; si no hay, insertar seed
  const row = db.prepare('SELECT COUNT(*) as count FROM students').get();
  if (row.count === 0) {
    const insert = db.prepare(`
      INSERT INTO students (firstName, lastName, email, age, major)
      VALUES (@firstName, @lastName, @email, @age, @major)
    `);

    const students = [
      { firstName: 'Ana', lastName: 'Gómez', email: 'ana.gomez@example.com', age: 20, major: 'Ingeniería' },
      { firstName: 'Juan', lastName: 'Pérez', email: 'juan.perez@example.com', age: 22, major: 'Matemáticas' },
      { firstName: 'Lucía', lastName: 'Martínez', email: 'lucia.martinez@example.com', age: 19, major: 'Física' }
    ];

    const insertMany = db.transaction((list) => {
      for (const s of list) insert.run(s);
    });
    insertMany(students);

    console.log('Tabla students creada y seed insertado.');
  } else {
    console.log('Tabla students ya tenía datos; no se insertó seed.');
  }
}

if (require.main === module) {
  try {
    init();
  } catch (err) {
    console.error('Error inicializando DB:', err);
    process.exit(1);
  }
}

module.exports = { init };