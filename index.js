import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { registerValidation } from "./validation/Auth.js";
import { validationResult } from "express-validator";
import UserModel from "./models/User.js";
import bcrypt from "bcrypt";

// req - что прислал клиент, res - что буду передавать клиенту

// подключаем базу данных
mongoose
  .connect(
    "mongodb+srv://admin:123321@clusterarchamernblog.zora3sp.mongodb.net/blog?retryWrites=true&w=majority&appName=ClusterArchaMernBlog"
  )
  .then(() => console.log("mongoDB connect ok"))
  .catch((err) => console.error("error mongoDB", err));
const app = express();
// нормальная обработка json, когда отправляем его с клиента в express
app.use(express.json());
// Создали registerValidation и если по запросу приходит что есть в нем
// то тогда выполняй колбэк
app.post("/auth/register", registerValidation, async (req, res) => {
  // Валидируем наши ошибки с помощью validationResult
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  // для создания шифра пароля
  const password = req.body.password;
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // cоздаем пользователя, передаем туда данные с fronta
  const doc = new UserModel({
    email: req.body.email,
    fullName: req.body.fullName,
    avatarUrl: req.body.avatarUrl,
    passwordHash,
  });

  // Создания пользователя в mongoDB, резултат который передаст mongoDB
  // приходит в переменную user
  const user = await doc.save()

  res.json(user);
});
// запускаем сам сервер
app.listen(4444, (err) => {
  if (err) {
    console.error(err);
  }
  console.log("Express server запущен");
});
