import express from "express";
import { getResenas, createResena, getAllResenas } from "../controllers/reseñasController.js";

const router = express.Router();

router.get("/", getAllResenas);
// GET  /resenas/:publicacioId
router.get("/:publicacioId", getResenas);

// POST /resenas/:publicacioId
router.post("/:publicacioId", createResena);

export default router;