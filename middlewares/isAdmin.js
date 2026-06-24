import jwt from "jsonwebtoken";


export const isAdmin = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No autorizado" });
  }

  try {
    const user = jwt.verify(
      header.slice(7),
      process.env.JWT_SECRET
    );

    if (user.rol !== "admin") {
      return res.status(403).json({
        message: "Acceso denegado"
      });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({
      message: "Token inválido"
    });
  }
};