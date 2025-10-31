// backend/src/api/resolvers.js
const { getAllStudents } = require('../queries/students');
const { getBreedById } = require('../queries/breeds');

const resolvers = {
  Query: {
    students: async () => getAllStudents(),
    breed: async (_, { id }) => getBreedById(id)
  }
};

module.exports = resolvers;
