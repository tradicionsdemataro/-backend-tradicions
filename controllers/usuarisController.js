// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { upload } from "../middlewares/upload.js";

export const register = async (req, res) => {
  try {
    const { nom, email, password } = req.body;

    if (!nom || !email || !password) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email ya registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      nom,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id, nom: user.nom, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (error) {
  console.error("🔥 REGISTER ERROR:", error);
  res.status(500).json({
    message: error.message,
  });
}
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validación básica (esto te estaba faltando)
    if (!email || !password) {
      return res.status(400).json({ message: "Faltan credenciales" });
    }

    // 2. Buscar usuario
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // 3. Seguridad: evitar crash si password es undefined
    if (!user.password) {
      return res.status(500).json({ message: "Usuario corrupto en BD" });
    }

    // 4. Comparar contraseña
    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // 5. JWT (protección por si JWT_SECRET no existe)
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET no definido");
      return res.status(500).json({ message: "Error de configuración del servidor" });
    }

    const token = jwt.sign(
      { id: user._id, nom: user.nom, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("LOGIN USER:", user.nom);
    return res.json({
      token,
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        rol: user.rol,
      },
    });

  } catch (error) {
    console.error("🔥 LOGIN ERROR REAL:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "Usuari no trobat" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const updateMe = async (req, res) => {
  try {
    const {
      nom,
      username,
      email,
      descripcion,
      telefono,
      ubicacion,
      fechaNacimiento,
      avatar,
      banner,
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        nom,
        username,
        email,
        descripcion,
        telefono,
        ubicacion,
        fechaNacimiento,
        ...(avatar && { avatar }),
        ...(banner && { banner }),
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user)
      return res.status(404).json({ message: "Usuari no trobat" });

    res.json({ user });
  } catch (err) {
    res.status(500).json({
      message: "Error actualitzant",
      error: err.message,
    });
  }
};