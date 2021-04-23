const { body } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.registerValidators = [
  body('email')
    .isEmail()
    .withMessage('Введите корректный email')
    .custom(async (value, { req }) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject('Такой email уже занят');
        }
      } catch (e) {
        console.log(e);
      }
    }),
  body('password', 'Пароль должен быть минимум 6 символов')
    .isLength({ min: 6, max: 56 })
    .isAlphanumeric()
    .trim(),
  body('confirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Пароли должны совпадать');
      }
      return true;
    })
    .trim(),
  body('name')
    .isLength({ min: 3 })
    .withMessage('Имя должно быть минимум 3 символа')
    .trim(),
];

let candidate = null;

exports.loginValidators = [
  body('email')
    .isEmail()
    .withMessage('Введите корректный email')
    .custom(async (value, { req }) => {
      try {
        candidate = await User.findOne({ email: value });

        if (!candidate) {
          return Promise.reject('Такого пользователя не существует');
        }
      } catch (e) {
        console.log(e);
      }
    }),
  body('password')
    .custom(async (value, { req }) => {
      try {
        if (!candidate) {
          return Promise.reject('Введите корректный email');
        }
        const areSame = await bcrypt.compare(value, candidate.password);

        if (!areSame) {
          return Promise.reject('Неверный пароль');
        }
        return true;
      } catch (e) {
        console.log(e);
      }
    })
    .isAlphanumeric()
    .trim(),
];

exports.courseValidators = [
  body('title')
    .isLength({ min: 3 })
    .withMessage('Минимальная длинна названия 3 символа'),
  body('price').isNumeric().withMessage('Введите корректную цену'),
  body('img', 'Введите корректный Url картинки').isURL(),
];
