import { body } from 'express-validator';

export const commentBodyValidator = [
  body('content')
    .isString()
    .withMessage('[content] should be a string')
    .trim()
    .notEmpty()
    .withMessage('required')
    .isLength({ min: 20, max: 300 })
    .withMessage('name should be less than 300 chars and more than 20'),
];
