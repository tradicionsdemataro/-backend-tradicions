import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ajusta esta ruta según tu proyecto
const DATA_DIR = path.join(__dirname, "../data");

const FILES = {
  events: "events.json",
  projectes: "projectes.json",
  publi: "publicacions.json",
  resenas: "reseñas.json",
  solicituds: "solicituts.json",
};

function getFilePath(key) {
  const file = FILES[key];

  if (!file) {
    throw new Error("INVALID_FILE");
  }

  return path.join(DATA_DIR, file);
}

/**
 * GET /admin/json/:file
 */
export async function getJsonFile(req, res) {
  try {
    const { file } = req.params;

    const filePath = getFilePath(file);

    const content = await fs.readFile(filePath, "utf8");

    const json = JSON.parse(content);

    res.json(json);
  } catch (err) {
    if (err.message === "INVALID_FILE") {
      return res.status(404).json({
        ok: false,
        error: "Fitxer no trobat",
      });
    }

    console.error(err);

    res.status(500).json({
      ok: false,
      error: "Error llegint el fitxer",
    });
  }
}

/**
 * PUT /admin/json/:file
 */
export async function updateJsonFile(req, res) {
  try {
    const { file } = req.params;

    const filePath = getFilePath(file);

    // Validación JSON
    const data = req.body;

    const prettyJson = JSON.stringify(data, null, 2);

    await fs.writeFile(filePath, prettyJson, "utf8");

    res.json({
      ok: true,
      message: "Fitxer actualitzat correctament",
    });
  } catch (err) {
    if (err.message === "INVALID_FILE") {
      return res.status(404).json({
        ok: false,
        error: "Fitxer no trobat",
      });
    }

    console.error(err);

    res.status(500).json({
      ok: false,
      error: "Error guardant el fitxer",
    });
  }
}