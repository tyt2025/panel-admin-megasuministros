/**
 * Normaliza texto para búsquedas eliminando acentos, mayúsculas y caracteres especiales
 * @param {string} text - Texto a normalizar
 * @returns {string} - Texto normalizado
 */
export function normalizeText(text) {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Descompone caracteres con acentos
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .replace(/[^a-z0-9\s]/g, '') // Elimina caracteres especiales excepto espacios
    .trim();
}
