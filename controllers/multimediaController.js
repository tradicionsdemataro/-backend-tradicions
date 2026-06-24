import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "../uploads");

if (!fsSync.existsSync(UPLOAD_DIR)) {
  fsSync.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ─────────────────────────────
// MULTER
// ─────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    );
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
});

// ─────────────────────────────
// GET
// ─────────────────────────────

export const getImages = async (req, res) => {
  try {
    const files = await fs.readdir(UPLOAD_DIR);

    const result = await Promise.all(
      files.map(async (file) => {
        const stat = await fs.stat(
          path.join(UPLOAD_DIR, file)
        );

        return {
          filename: file,
          url: `/uploads/${file}`,
          size: stat.size,
          uploadedAt: stat.birthtime,
        };
      })
    );

    result.sort(
      (a, b) =>
        new Date(b.uploadedAt) -
        new Date(a.uploadedAt)
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error loading images",
    });
  }
};

// ─────────────────────────────
// POST
// ─────────────────────────────

export const uploadImages = async (req, res) => {
  try {
    const files = req.files || [];

    res.status(201).json({
      ok: true,
      uploaded: files.length,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Upload error",
    });
  }
};

// ─────────────────────────────
// DELETE
// ─────────────────────────────

export const deleteImage = async (req, res) => {
  try {
    const filename = req.params.filename;

    const filePath = path.join(
      UPLOAD_DIR,
      filename
    );

    await fs.unlink(filePath);

    res.json({
      ok: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Delete error",
    });
  }
};