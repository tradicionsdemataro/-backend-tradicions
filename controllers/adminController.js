import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "../data");

// ─────────────────────────────────────────────
// CONFIG MAP
// Claves que usa cada JSON internamente
// ─────────────────────────────────────────────

const map = {
  events:    { file: "events.json",    key: "events"    },
  projectes: { file: "projectes.json", key: "projectes" },
  publi:     { file: "publicacions.json",     key: "publicacions" },   // ← clave real del JSON
  resenas:   { file: "resenas.json",   key: "reseñas"   },      // ← clave real del JSON
  solicituds:{ file: "solicituds.json",key: "solicituts"},       // ← typo intencionado del JSON
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

async function readJSON(resource) {
  const cfg = map[resource];
  if (!cfg) throw new Error(`Unknown resource: ${resource}`);

  try {
    const raw    = await fs.readFile(path.join(DATA_DIR, cfg.file), "utf-8");
    const parsed = JSON.parse(raw || "{}");
    return parsed[cfg.key] ?? [];
  } catch (err) {
    // Si el fichero no existe, devolvemos array vacío
    if (err.code === "ENOENT") return [];
    console.error(`READ ERROR [${resource}]:`, err.message);
    return [];
  }
}

async function writeJSON(resource, array) {
  const cfg = map[resource];
  if (!cfg) throw new Error(`Unknown resource: ${resource}`);

  const filePath = path.join(DATA_DIR, cfg.file);
  await fs.writeFile(filePath, JSON.stringify({ [cfg.key]: array }, null, 2));
}

function findById(array, id) {
  return array.findIndex(
    (x) => String(x._id ?? x.id) === String(id)
  );
}
// ─────────────────────────────────────────────
// CRUD GENÉRICO
// ─────────────────────────────────────────────

export const getAll = (resource) => async (req, res) => {
  try {
    const data = await readJSON(resource);
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error reading data" });
  }
};

export const getOne = (resource) => async (req, res) => {
  try {
    const data  = await readJSON(resource);
    const index = findById(data, req.params.id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    res.json(data[index]);
  } catch {
    res.status(500).json({ error: "Error reading item" });
  }
};

export const createOne = (resource) => async (req, res) => {
  try {
    const data = await readJSON(resource);

    const nextId =
      data.length > 0
        ? Math.max(...data.map(i => Number(i.id || i._id || 0))) + 1
        : 1;

    const newItem = {
      ...req.body,
      id: nextId,
      createdAt: new Date().toISOString(),
    };

    data.push(newItem);
    await writeJSON(resource, data);

    // 🔥 IMPORTANTE: devuelve SIEMPRE la lista actualizada
    res.status(201).json(data);

  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: "Error creating item" });
  }
};

export const updateOne = (resource) => async (req, res) => {
  try {
    const data = await readJSON(resource);
    const id = String(req.params.id);

    const index = data.findIndex(
      (x) => String(x._id ?? x.id) === id
    );

    if (index === -1) {
      return res.status(404).json({ error: "Not found" });
    }

    data[index] = {
      ...data[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    await writeJSON(resource, data);
    res.json(data[index]);
  } catch {
    res.status(500).json({ error: "Error updating item" });
  }
};

// PATCH parcial — usado por sol·licituds para cambiar estat
export const patchOne = (resource) => async (req, res) => {
  try {
    const data  = await readJSON(resource);
    const index = findById(data, req.params.id);
    if (index === -1) return res.status(404).json({ error: "Not found" });

    // Solo actualiza los campos enviados
    data[index] = { ...data[index], ...req.body, updatedAt: new Date().toISOString() };
    await writeJSON(resource, data);
    res.json(data[index]);
  } catch {
    res.status(500).json({ error: "Error patching item" });
  }
};

export const deleteOne = (resource) => async (req, res) => {
  try {
    const data = await readJSON(resource);
    const id = String(req.params.id);

    const filtered = data.filter(
      (x) => String(x._id ?? x.id) !== id
    );

    if (filtered.length === data.length) {
      return res.status(404).json({ error: "Not found" });
    }

    await writeJSON(resource, filtered);
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Error deleting item" });
  }
};

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────

export const getAdminStats = async (req, res) => {
  try {
    const [events, projectes, publi, resenas, solicituds] = await Promise.all([
      readJSON("events"),
      readJSON("projectes"),
      readJSON("publi"),
      readJSON("resenas"),
      readJSON("solicituds"),
    ]);

    res.json({
      totalEvents:    events.length,
      totalProjectes: projectes.length,
      totalPubli:     publi.length,
      totalRessenyes: resenas.length,
      totalSolicituds:solicituds.length,
      totalVisits:    0,
    });
  } catch {
    res.status(500).json({ error: "Error loading stats" });
  }
};

export const getVisits = async (req, res) => {
  try {
    const dies = ["Dl", "Dm", "Dc", "Dj", "Dv", "Ds", "Dg"];
    const last30 = Array.from({ length: 30 }, (_, i) => ({
      label: dies[i % 7],
      date:  new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
      count: Math.floor(Math.random() * 180) + 20,
    }));
    res.json(last30);
  } catch {
    res.status(500).json({ error: "Error loading visits" });
  }
};