import { body } from 'express-validator';

export const newPasswordBodyValidator = [
  body('newPassword')
    .trim()
    .notEmpty()
    .withMessage('required')
    .isLength({ min: 6, max: 20 })
    .withMessage('password should be less than 20 chars and more than 5'),
];
