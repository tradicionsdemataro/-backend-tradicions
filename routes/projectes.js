import express from "express";
import { getProjectes } from "../controllers/projectesController.js";

const router = express.Router();

router.get("/", getProjectes);

export default router;