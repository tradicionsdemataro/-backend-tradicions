import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH   = path.join(__dirname, "../data/reseñas.json");

// ─── Helpers JSON ─────────────────────────────────────────────────────────────
function readDB() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// ─── Helper token ─────────────────────────────────────────────────────────────
function getUserFromToken(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// ─── GET /publi/:publicacioId/ressenyes ───────────────────────────────────────
export const getResenas = (req, res) => {
  try {
    const { publicacioId } = req.params;
    const db       = readDB();
    const resultat = db.reseñas.filter(r => r.publicacio_id === publicacioId);
    return res.status(200).json(resultat);
  } catch (err) {
    console.error("Error GET ressenyes:", err.message);
    return res.status(500).json({ ok: false, message: "Error intern del servidor" });
  }
};

// ─── POST /publi/:publicacioId/ressenyes ──────────────────────────────────────
export const createResena = (req, res) => {
  const user = getUserFromToken(req);
  if (!user) {
    return res.status(401).json({ ok: false, message: "No autoritzat" });
  }

  const { publicacioId } = req.params;
  const { text, rating } = req.body;

  if (!text?.trim()) {
    return res.status(400).json({ ok: false, message: "El text és obligatori" });
  }
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ ok: false, message: "La puntuació ha de ser entre 1 i 5" });
  }
  if (text.trim().length > 400) {
    return res.status(400).json({ ok: false, message: "Màxim 400 caràcters" });
  }

  try {
    const db     = readDB();
    const nextId = db.reseñas.length > 0
      ? Math.max(...db.reseñas.map(r => r.id)) + 1
      : 1;

    const nova = {
      id:            nextId,
      publicacio_id: publicacioId,
      usuari_id:     String(user.id ?? user._id),
      autor:         user.nom,
      rating:        Number(rating),
      text:          text.trim(),
      data:          new Date().toISOString(),
    };

    console.log("USER TOKEN:", user);

    db.reseñas.push(nova);
    writeDB(db);

    return res.status(201).json(nova);
  } catch (err) {
    console.error("Error POST ressenya:", err.message);
    return res.status(500).json({ ok: false, message: "Error intern del servidor" });
  }
};

// ─── GET /resenas ────────────────────────────────────────────────────────────
export const getAllResenas = (req, res) => {
  try {
    const db = readDB();

    return res.status(200).json({
      ok: true,
      total: db.reseñas.length,
      resenas: db.reseñas,
    });
  } catch (err) {
    console.error("Error GET totes les ressenyes:", err.message);

    return res.status(500).json({
      ok: false,
      message: "Error intern del servidor",
    });
  }
};