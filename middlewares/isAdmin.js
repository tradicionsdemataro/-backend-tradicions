import jwt from "jsonwebtoken";

const HOME_URL = "https://tradicionsdemataro.github.io/tradicionsdemataro/";

export const isAdmin = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.redirect(HOME_URL);
  }

  try {
    const user = jwt.verify(
      header.slice(7),
      process.env.JWT_SECRET
    );

    if (user.rol !== "admin") {
      return res.redirect(HOME_URL);
    }

    req.user = user;
    next();
  } catch {
    return res.redirect(HOME_URL);
  }
};