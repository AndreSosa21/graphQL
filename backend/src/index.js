// backend/src/index.js
const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema/typeDefs');
const resolvers = require('./api/resolvers');

const { init } = require('./db/init');
init();

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const port = process.env.PORT || 4000;
server.listen({ port }).then(({ url }) => {
  console.log(`Servidor corriendo en ${url}`);
});