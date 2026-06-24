import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

// Simular __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache en memòria
let cache = null;
let cacheTimestamp = null;
const CACHE_TTL_MS = 30 * 1000;

// Validació estructura
function validarEstructura(data) {
  if (!data || typeof data !== "object") {
    throw new Error("JSON invàlid: no és un objecte");
  }

  if (!Array.isArray(data.events)) {
    throw new Error("JSON invàlid: 'events' ha de ser un array");
  }

  data.events.forEach((event, index) => {
    if (!event || typeof event !== "object") {
      throw new Error(`Event ${index} invàlid`);
    }

    const campsObligatoris = [
      "id",
      "titol",
      "data",
      "descripcio"
    ];

    for (const camp of campsObligatoris) {
      if (!event[camp]) {
        throw new Error(`Event ${index}: falta el camp '${camp}'`);
      }
    }

    if (isNaN(Date.parse(event.data))) {
      throw new Error(`Event ${index}: data invàlida`);
    }
  });

  return true;
}

// Carregar fitxer amb cache
async function carregarEvents() {
  const now = Date.now();

  if (cache && cacheTimestamp && now - cacheTimestamp < CACHE_TTL_MS) {
    return cache;
  }

  const filePath = path.join(__dirname, "../data/events.json");

  let raw;

  try {
    raw = await fs.readFile(filePath, "utf-8");
  } catch {
    const error = new Error("No s'ha pogut llegir el fitxer d'events");
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

// GET /api/events
export const getEvents = async (req, res) => {
  try {
    const { limit } = req.query;

    const data = await carregarEvents();

    let result = data.events;

    // Ordenar per data (més recents primer)
    result.sort(
      (a, b) => new Date(b.data) - new Date(a.data)
    );

    // Limitar resultats
    if (limit) {
      const lim = parseInt(limit, 10);

      if (!isNaN(lim) && lim > 0) {
        result = result.slice(0, lim);
      }
    }

    return res.status(200).json({
      ok: true,
      total: result.length,
      events: result
    });
  } catch (error) {
    console.error("Error GET events:", error.message);

    return res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message || "Error intern del servidor"
    });
  }
};