import { body } from 'express-validator';

export const loginBodyValidator = [
  body('loginOrEmail')
    .trim()
    .notEmpty()
    .withMessage('required')
    .isLength({ min: 3, max: 20 })
    .withMessage('[loginOrEmail] should be more than 2 and less than 20 characters'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('required')
    .isLength({ min: 6, max: 20 })
    .withMessage('password should be less than 20 chars and more than 5'),
];
