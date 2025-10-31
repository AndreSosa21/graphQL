// backend/src/schema/typeDefs.js
const { gql } = require('apollo-server');

const typeDefs = gql`
  type Student {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    age: Int
    major: String
  }

  type Query {
    # Devuelve todos los estudiantes; el cliente decide qué campos pedir
    students: [Student!]!
  }
`;

module.exports = typeDefs;