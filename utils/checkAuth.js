import jwt from "jsonwebtoken";

export default (req, res, next) => {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
  if (token) {
    try {
      const decoded = jwt.verify(token, "secret123");
			// Вшиваем в req - id пользователя, чтобы потом из любого места можно достать 
			// и проверить авторизован человек (по id) или нет
      req.userId = decoded._id;
			next()
    } catch (error) {
      return res.status(403).json({
        message: "Нет доступа",
      });
    }
  } else {
    return res.status(403).json({
      message: "Нет доступа",
    });
  }
};
