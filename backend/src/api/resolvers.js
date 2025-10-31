// backend/src/api/resolvers.js
const { getAllStudents } = require('../queries/students');

const resolvers = {
  Query: {
    students: async () => {
      const students = getAllStudents();
      return students;
    }
  }
};

module.exports = resolvers;