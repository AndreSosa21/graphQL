// backend/src/queries/breeds.js
const axios = require('axios');
require('dotenv').config();

const CATS_API_URL = process.env.CATS_API_URL;
const CATS_API_KEY = process.env.CATS_API_KEY;

/**
 * Obtiene una raza de gato desde la API externa según su ID
 * Devuelve todos los campos para que el frontend seleccione los que necesite.
 */
async function getBreedById(id) {
  try {
    const response = await axios.get(CATS_API_URL, {
      headers: { 'x-api-key': CATS_API_KEY }
    });

    const breed = response.data.find((b) => b.id === id);
    if (!breed) throw new Error(`No se encontró la raza con id: ${id}`);

    // Retornamos todo el objeto de la API; GraphQL limitará lo que se entregue a lo que está en typeDefs
    return breed;
  } catch (error) {
    console.error('Error al obtener raza:', error.message);
    throw new Error('No se pudo conectar con la API de razas');
  }
}
module.exports = { getBreedById };
