import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

mongoose
  .connect(
    "mongodb+srv://admin:123321@clusterarchamernblog.zora3sp.mongodb.net/?retryWrites=true&w=majority&appName=ClusterArchaMernBlog"
  )
  .then(() => console.log("mongoDB connect ok"))
  .catch((err) => console.error("error mongoDB", err));
const app = express();
// нормальная обработка json, когда отправляем его с клиента в express
app.use(express.json());
// req - что прислал клиент, res - что буду передавать клиенту
app.get("/", (req, res) => {
  res.send("Ответ от сервера");
});
app.post("/auth/login", (req, res) => {
  console.log(req.body);
  // создаем токен, и шифруем объект, потом его передаем клиенту на фронт
  const token = jwt.sign(
    {
      email: req.body.email,
      fullName: "Вася Петрович",
    },
    "secret123"
  );

  res.json({
    success: true,
    token,
  });
});
// запускаем сам сервер
app.listen(4444, (err) => {
  if (err) {
    console.error(err);
  }
  console.log("Express server запущен");
});
