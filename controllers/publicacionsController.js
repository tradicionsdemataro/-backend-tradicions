import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

// Simular __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache en memoria
let cache = null;
let cacheTimestamp = null;
const CACHE_TTL_MS = 30 * 1000;

// Validación básica
function validarEstructura(data) {
  if (!data || typeof data !== "object") {
    throw new Error("JSON invàlid: no és un objecte");
  }

  if (!Array.isArray(data.publicacions)) {
    throw new Error("JSON invàlid: 'publicacions' ha de ser un array");
  }

  data.publicacions.forEach((pub, index) => {
    if (!pub || typeof pub !== "object") {
      throw new Error(`Publicació ${index} invàlida`);
    }

    const campsObligatoris = ["id", "titol", "data_publicacio", "descripcio"];

    for (const camp of campsObligatoris) {
      if (!pub[camp]) {
        throw new Error(`Publicació ${index}: falta el camp '${camp}'`);
      }
    }

    if (isNaN(Date.parse(pub.data_publicacio))) {
      throw new Error(`Publicació ${index}: data_publicacio invàlida`);
    }
  });

  return true;
}

// Carregar fitxer amb cache
async function carregarPublicacions() {
  const now = Date.now();

  if (cache && cacheTimestamp && now - cacheTimestamp < CACHE_TTL_MS) {
    return cache;
  }

  const filePath = path.join(__dirname, "../data/publicacions.json");

  let raw;

  try {
    raw = await fs.readFile(filePath, "utf-8");
  } catch {
    const error = new Error("No s'ha pogut llegir el fitxer de publicacions");
    error.statusCode = 500;
    throw error;
  }

  let json;

  try {
    json = JSON.parse(raw);
  } catch {
    const error = new Error("JSON mal formatat");
    error.statusCode = 500;
    throw error;
  }

  validarEstructura(json);

  cache = json;
  cacheTimestamp = now;

  return json;
}

// ✅ CONTROLLER
export const getPublicacions = async (req, res) => {
  try {
    const { categoria, destacat, limit } = req.query;

    const data = await carregarPublicacions();

    let result = data.publicacions;

    if (categoria) {
      result = result.filter(
        (p) =>
          p.categoria &&
          p.categoria.toLowerCase() === categoria.toLowerCase()
      );
    }

    if (destacat === "true") {
      result = result.filter((p) => p.destacat === true);
    }

    result.sort(
      (a, b) =>
        new Date(b.data_publicacio) - new Date(a.data_publicacio)
    );

    if (limit) {
      const lim = parseInt(limit, 10);
      if (!isNaN(lim) && lim > 0) {
        result = result.slice(0, lim);
      }
    }

    return res.status(200).json({
      ok: true,
      total: result.length,
      filters: {
        categoria: categoria || null,
        destacat: destacat || null,
        limit: limit || null
      },
      publicacions: result
    });
  } catch (error) {
    console.error("Error GET publicacions:", error.message);

    return res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message || "Error intern del servidor"
    });
  }
};