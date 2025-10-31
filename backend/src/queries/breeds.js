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
      headers: {
        'x-api-key': CATS_API_KEY
      }
    });

    // Buscar la raza por su ID
    const breed = response.data.find((b) => b.id === id);

    if (!breed) {
      throw new Error(`No se encontró la raza con id: ${id}`);
    }

    // Devolvemos todos los campos disponibles en la API que definimos en typeDefs
    return {
      id: breed.id,
      name: breed.name,
      origin: breed.origin,
      temperament: breed.temperament,
      description: breed.description,
      life_span: breed.life_span,
      adaptability: breed.adaptability,
      affection_level: breed.affection_level,
      child_friendly: breed.child_friendly,
      dog_friendly: breed.dog_friendly,
      energy_level: breed.energy_level,
      grooming: breed.grooming,
      intelligence: breed.intelligence,
      social_needs: breed.social_needs,
      stranger_friendly: breed.stranger_friendly,
      vocalisation: breed.vocalisation,
      wikipedia_url: breed.wikipedia_url,
      reference_image_id: breed.reference_image_id
    };
  } catch (error) {
    console.error('Error al obtener raza:', error.message);
    throw new Error('No se pudo conectar con la API de razas');
  }
}

module.exports = { getBreedById };
