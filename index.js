import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { registerValidation } from "./validation/Auth.js";
import { validationResult } from "express-validator";
import UserModel from "./models/User.js";
import checkAuth from "./utils/checkAuth.js";
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

// АВТОРИЗАЦИЯ
app.post("/auth/login", async (req, res) => {
  try {
    // Ищем в базе данных данного пользователя по email
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }
    // Сравниваем пароль который прислал пользователь с паролем из БД
    const isValidPass = await bcrypt.compare(
      req.body.password,
      user.passwordHash
    );

    if (!isValidPass) {
      return res.status(404).json({
        message: "Неверный пароль",
      });
    }
    // Создаем токен с зашифрованным id с базы данных 
    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );
    // Что бы не передавать клиенту хэш-пароль, с помощью диструктуризации удаляем его
    const { passwordHash, ...userData } = user._doc;
    // передаем клиенту данные о созданом пользователи и токен с зашифрованным id
    res.json({
      ...userData,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Не удалось авторизоваться",
    });
    console.log(error);
  }
});

// РЕГИСТРАЦИЯ
app.post("/auth/register", registerValidation, async (req, res) => {
  try {
    // Валидируем наши ошибки с помощью validationResult
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    // для создания шифра пароля
    const password = req.body.password; // пароль, который прислал клиент
    const salt = await bcrypt.genSalt(10); // соль Питерская
    const hash = await bcrypt.hash(password, salt);

    // cоздаем пользователя, передаем туда данные с fronta
    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    });
    // Создания пользователя в mongoDB, сохраняем в базе данных
    // В user будет хранится данные о создании пользователя, которые мы передаем
    // с фронта на бэкенд
    const user = await doc.save();
    // // Создаем токен с зашифрованным id с базы данных 
    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );
    // Что бы не передавать клиенту хэш-пароль, с помощью диструктуризации удаляем его
    const { passwordHash, ...userData } = user._doc;
    // передаем клиенту данные о созданом пользователи и токен с id из БД
    res.json({
      ...userData,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось зарегистрироваться",
    });
  }
});

// Получение данных о себе (Проверка токена)
app.get("/auth/me", checkAuth , async (req, res) => {
  try {
    res.json({
      suc: true
    })
  } catch (error) {
    
  }
})
// запускаем сам сервер
app.listen(4444, (err) => {
  if (err) {
    console.error(err);
  }
  console.log("Express server запущен");
});
