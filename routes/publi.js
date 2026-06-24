import express from "express";
import { getPublicacions } from "../controllers/publicacionsController.js";

const router = express.Router();

router.get("/", getPublicacions);

export default router;