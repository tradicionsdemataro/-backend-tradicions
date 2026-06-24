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

function validarEstructura(data) {
  if (!data || typeof data !== "object") {
    throw new Error("JSON invàlid: no és un objecte");
  }

  if (!Array.isArray(data.projectes)) {
    throw new Error("JSON invàlid: 'projectes' ha de ser un array");
  }

  data.projectes.forEach((projecte, index) => {
    if (!projecte || typeof projecte !== "object") {
      throw new Error(`Projecte ${index} invàlid`);
    }

    // Només id i titol són realment obligatoris
    const campsObligatoris = ["id", "titol"];

    for (const camp of campsObligatoris) {
      if (!projecte[camp]) {
        throw new Error(`Projecte ${index}: falta el camp '${camp}'`);
      }
    }

    // data_publicacio: validar només si existeix
    if (projecte.data_publicacio && isNaN(Date.parse(projecte.data_publicacio))) {
      throw new Error(`Projecte ${index}: data_publicacio invàlida`);
    }
  });

  return true;
}

// Carregar fitxer amb cache
async function carregarProjectes() {
  const now = Date.now();

  if (cache && cacheTimestamp && now - cacheTimestamp < CACHE_TTL_MS) {
    return cache;
  }

  const filePath = path.join(__dirname, "../data/projectes.json");

  let raw;

  try {
    raw = await fs.readFile(filePath, "utf-8");
  } catch {
    const error = new Error("No s'ha pogut llegir el fitxer de projectes");
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

export const getProjectes = async (req, res) => {
  try {
    const { categoria, destacat, estat, limit } = req.query;

    const data = await carregarProjectes();

    let result = data.projectes;

    if (categoria) {
      result = result.filter(
        (p) => p.categoria?.toLowerCase() === categoria.toLowerCase()
      );
    }

    if (estat) {
      result = result.filter(
        (p) => p.estat?.toLowerCase() === estat.toLowerCase()
      );
    }

    if (destacat === "true") {
      result = result.filter((p) => p.destacat === true);
    }

    // Normalitza data_publicacio — accepta camps alternatius
    result = result.map((p) => ({
      ...p,
      data_publicacio: p.data_publicacio ?? p.data ?? p.created_at ?? null,
    }));

    // Sort robust — nulls al final
    result.sort((a, b) => {
      if (!a.data_publicacio) return 1;
      if (!b.data_publicacio) return -1;
      return new Date(b.data_publicacio) - new Date(a.data_publicacio);
    });

    if (limit) {
      const lim = parseInt(limit, 10);
      if (!isNaN(lim) && lim > 0) result = result.slice(0, lim);
    }

    return res.status(200).json({
      ok: true,
      total: result.length,
      filters: {
        categoria: categoria || null,
        estat: estat || null,
        destacat: destacat || null,
        limit: limit || null,
      },
      projectes: result,
    });
  } catch (error) {
    console.error("Error GET projectes:", error.message);
    return res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message || "Error intern del servidor",
    });
  }
};