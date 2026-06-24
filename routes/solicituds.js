import express from "express";
import {
  crearSolicitud,
  obtenirSolicituts
} from "../controllers/soliController.js";

const router = express.Router();

router.post("/", crearSolicitud);
router.get("/", obtenirSolicituts);

export default router;