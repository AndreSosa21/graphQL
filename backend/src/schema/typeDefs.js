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

  type Weight {
    imperial: String
    metric: String
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
    weight: Weight
    cfa_url: String
    vetstreet_url: String
    vcahospitals_url: String
    country_codes: String
    country_code: String
    indoor: Int
    lap: Int
    alt_names: String
    health_issues: Int
    shedding_level: Int
    experimental: Int
    hairless: Int
    natural: Int
    rare: Int
    rex: Int
    suppressed_tail: Int
    short_legs: Int
    hypoallergenic: Int
  }

  type Query {
    students: [Student!]!
    breed(id: ID!): Breed
  }
`;

module.exports = typeDefs;
