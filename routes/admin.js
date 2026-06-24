import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { upload } from "../middlewares/upload.js";
import {
  getAll,
  getOne,
  createOne,
  updateOne,
  patchOne,
  deleteOne,
  getAdminStats,
  getVisits,
} from "../controllers/adminController.js";


import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/adminUserController.js";

import {
  getJsonFile,
  updateJsonFile,
} from "../controllers/adminJsonController.js";

// Importa tu middleware de auth si lo tienes
// import { verifyToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Si quieres proteger todas las rutas admin, descomenta:
// router.use(verifyToken, requireAdmin);

/* =========================
   DASHBOARD
   GET /admin/stats
   GET /admin/visits
========================= */
router.get("/stats",  getAdminStats);
router.get("/visits", getVisits);

/* =========================
   EVENTS
   El servidor monta este router en /admin,
   así que estas rutas son:
     GET    /admin/events
     GET    /admin/events/:id
     POST   /admin/events
     PUT    /admin/events/:id
     DELETE /admin/events/:id
========================= */
router.get(   "/events",     getAll("events"));
router.get(   "/events/:id", getOne("events"));
router.post(  "/events",     createOne("events"));
router.put(   "/events/:id", updateOne("events"));
router.delete("/events/:id", deleteOne("events"));

/* =========================
   PROJECTES
   GET    /admin/projectes
   POST   /admin/projectes
   PUT    /admin/projectes/:id
   DELETE /admin/projectes/:id
========================= */
router.get(   "/projectes",     getAll("projectes"));
router.get(   "/projectes/:id", getOne("projectes"));
router.post(  "/projectes",     createOne("projectes"));
router.put(   "/projectes/:id", updateOne("projectes"));
router.delete("/projectes/:id", deleteOne("projectes"));

/* =========================
   PUBLICACIONS
   GET    /admin/publi
   POST   /admin/publi
   PUT    /admin/publi/:id
   DELETE /admin/publi/:id
========================= */
router.get(   "/publi",     getAll("publi"));
router.get(   "/publi/:id", getOne("publi"));
router.post(  "/publi",     createOne("publi"));
router.put(   "/publi/:id", updateOne("publi"));
router.delete("/publi/:id", deleteOne("publi"));

/* =========================
   RESSENYES
   GET    /admin/resenas        → listar
   GET    /admin/resenas/:id    → detall
   DELETE /admin/resenas/:id    → eliminar (admins no crean ressenyes)
========================= */
router.get(   "/resenas",     getAll("resenas"));
router.get(   "/resenas/:id", getOne("resenas"));
router.delete("/resenas/:id", deleteOne("resenas"));

/* =========================
   SOL·LICITUDS / VOLUNTARIS
   GET    /admin/solicituds
   GET    /admin/solicituds/:id
   PATCH  /admin/solicituds/:id   → cambiar estat
   DELETE /admin/solicituds/:id
========================= */
router.get(   "/solicituds",     getAll("solicituds"));
router.get(   "/solicituds/:id", getOne("solicituds"));
router.patch( "/solicituds/:id", patchOne("solicituds"));
router.delete("/solicituds/:id", deleteOne("solicituds"));


/* =========================
   USERS
   GET    /admin/users
   GET    /admin/users/:id
   POST   /admin/users
   PUT    /admin/users/:id
   DELETE /admin/users/:id
========================= */
router.get("/users", getUsers);
router.get("/users/:id", getUser);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

/*ARXIUS JSON EDITOR CODI*/

router.get("/json/:file", getJsonFile);
router.put("/json/:file", updateJsonFile);

export default router;