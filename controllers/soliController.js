import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILE_PATH = path.join(
  __dirname,
  "../data/solicituts.json"
);

export const crearSolicitud = async (req, res) => {
  try {
    const {
      nom,
      email,
      telefon,
      assumpte,
      missatge
    } = req.body;

    if (!nom || !email || !assumpte || !missatge) {
      return res.status(400).json({
        ok: false,
        message: "Falten camps obligatoris"
      });
    }

    let data;

    try {
      const raw = await fs.readFile(FILE_PATH, "utf8");
      data = JSON.parse(raw);
    } catch {
      data = {
        solicituts: []
      };
    }

    const ultimaId =
      data.solicituts.length > 0
        ? Math.max(...data.solicituts.map((s) => s.id))
        : 0;

    const novaSolicitud = {
      id: ultimaId + 1,
      nom,
      email,
      telefon: telefon || "",
      assumpte,
      missatge,
      data_creacio: new Date().toISOString()
    };

    data.solicituts.push(novaSolicitud);

    await fs.writeFile(
      FILE_PATH,
      JSON.stringify(data, null, 2),
      "utf8"
    );

    return res.status(201).json({
      ok: true,
      message: "Sol·licitud guardada correctament",
      solicitud: novaSolicitud
    });
  } catch (error) {
    console.error("Error guardant solicitud:", error);

    return res.status(500).json({
      ok: false,
      message: "Error intern del servidor"
    });
  }
};


export const obtenirSolicituts = async (req, res) => {
  try {
    let data;

    try {
      const raw = await fs.readFile(FILE_PATH, "utf8");
      data = JSON.parse(raw);
    } catch {
      data = { solicituts: [] };
    }

    return res.status(200).json({
      ok: true,
      solicituts: data.solicituts
    });
  } catch (error) {
    console.error("Error obtenint solicituts:", error);

    return res.status(500).json({
      ok: false,
      message: "Error intern del servidor"
    });
  }
};