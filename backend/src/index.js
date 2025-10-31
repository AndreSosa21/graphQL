// backend/src/index.js
require('dotenv').config();
const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema/typeDefs');
const resolvers = require('./api/resolvers');
const { init } = require('./db/init');

// Inicializa la base de datos SQLite
init();

// Configura Apollo Server con CORS habilitado
const server = new ApolloServer({
  typeDefs,
  resolvers,
  cors: {
    origin: '*', // Permitir cualquier origen (útil para desarrollo y Vercel)
    credentials: true, // Permitir envío de cookies/cabeceras si fuera necesario
  },
  introspection: true
});

// Puerto (usa el de Vercel o 4000 localmente)
const port = process.env.PORT || 4000;

server.listen({ port }).then(({ url }) => {
  console.log(`🚀 Servidor corriendo con CORS habilitado en ${url}`);
});
