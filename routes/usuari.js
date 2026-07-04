import express from "express";
import {
  register,
  login,
  getMe,
  updateMe,
} from "../controllers/usuarisController.js";

import { verifyToken } from "../middlewares/verifyToken.js";
import { upload } from "../middlewares/upload.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.post("/perfil", verifyToken, getMe);
router.put("/perfil", verifyToken, updateMe);

/* =========================
   UPLOAD AVATAR/BANNER
========================= */
router.post(
  "/upload",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      const field = req.body.field; // "avatar" o "banner"

      if (!field) {
        return res.status(400).json({ message: "Field required (avatar/banner)" });
      }

      const imageUrl = `https://backend-tradicions.onrender.com/uploads/${req.file.filename}`;

      const user = await User.findByIdAndUpdate(
        req.userId,
        {
          [field]: imageUrl,
        },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "Usuari no trobat" });
      }

      res.json({ user });

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({
        message: "Error uploading image",
        error: err.message,
      });
    }
  }
);


router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "Usuari no trobat" });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

export default router;