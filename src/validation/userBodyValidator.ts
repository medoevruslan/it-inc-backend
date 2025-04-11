import { body } from 'express-validator';

export const userBodyValidator = [
  body('login')
    .matches(/^[a-zA-Z0-9_-]*$/)
    .withMessage('[login] should be valid string')
    .trim()
    .notEmpty()
    .withMessage('required')
    .isLength({ min: 3, max: 10 })
    .withMessage('[login] should be more than 2 and less than 10 characters'),
  body('email')
    .isString()
    .withMessage('[email] should be a string')
    .isEmail()
    .withMessage('[email] should be a valid email name')
    .trim()
    .notEmpty()
    .withMessage('required'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('required')
    .isLength({ min: 6, max: 20 })
    .withMessage('password should be less than 20 chars and more than 5'),
];
