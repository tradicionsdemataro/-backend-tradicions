import express from "express";
import { upload } from "../middlewares/upload.js";

import {
  getImages,
  uploadImages,
  deleteImage,
} from "../controllers/multimediaController.js";

const router = express.Router();

// GET /admin/multimedia
router.get("/", getImages);

// POST /admin/multimedia
router.post("/", upload.array("files", 20), uploadImages);

// DELETE /admin/multimedia/:filename
router.delete("/:filename", deleteImage);

export default router;