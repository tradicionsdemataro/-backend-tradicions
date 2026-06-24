import User from "../models/User.js";

/* =========================
   GET /admin/users
========================= */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obtenint usuaris" });
  }
};

/* =========================
   GET /admin/users/:id
========================= */
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "Usuari no trobat" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obtenint usuari" });
  }
};

/* =========================
   POST /admin/users
========================= */
export const createUser = async (req, res) => {
  try {
    const {
      nom,
      email,
      password,
      telefon,
      rol,
      fechaNacimiento,
      direccion,
      ciutat,
      provincia,
      cp,
    } = req.body;

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({
        error: "Aquest email ja existeix",
      });
    }

    const user = await User.create({
      nom,
      email,
      password,
      telefon,
      rol,
      fechaNacimiento,
      direccion,
      ciutat,
      provincia,
      cp,
    });

    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creant usuari" });
  }
};

/* =========================
   PUT /admin/users/:id
========================= */
export const updateUser = async (req, res) => {
  try {
    const data = { ...req.body };

    // Si no viene password no la tocamos
    if (!data.password) {
      delete data.password;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      data,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        error: "Usuari no trobat",
      });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error actualitzant usuari",
    });
  }
};

/* =========================
   DELETE /admin/users/:id
========================= */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        error: "Usuari no trobat",
      });
    }

    res.json({
      ok: true,
      message: "Usuari eliminat",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error eliminant usuari",
    });
  }
};