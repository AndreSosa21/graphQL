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

  type Breed {
    id: ID!
    name: String!
    origin: String
    temperament: String
    description: String
    life_span: String
    adaptability: Int
    affection_level: Int
    child_friendly: Int
    dog_friendly: Int
    energy_level: Int
    grooming: Int
    intelligence: Int
    social_needs: Int
    stranger_friendly: Int
    vocalisation: Int
    wikipedia_url: String
    reference_image_id: String
  }

  type Query {
    # Devuelve todos los estudiantes desde SQLite
    students: [Student!]!

    # Devuelve una raza de gato según su ID desde la API externa
    breed(id: ID!): Breed
  }
`;

module.exports = typeDefs;
