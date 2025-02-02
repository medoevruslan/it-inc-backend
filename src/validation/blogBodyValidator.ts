import { body } from 'express-validator';
import { ObjectId } from 'mongodb';

export const blogBodyValidator = [
  body('name')
    .isString()
    .withMessage('[name] should be a string')
    .trim()
    .notEmpty()
    .withMessage('required')
    .isLength({ max: 15 })
    .withMessage('name should be less than 15 chars'),
  body('description')
    .isString()
    .withMessage('[description] should be a string')
    .trim()
    .notEmpty()
    .withMessage('required')
    .isLength({ max: 500 })
    .withMessage('description should be less than 500 chars'),
  body('websiteUrl')
    .matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
    .withMessage('websiteUrl should be a proper url')
    .trim()
    .isLength({ max: 100 })
    .withMessage('websiteUrl should be less than 100 chars'),
  body('_id').customSanitizer((value) => {
    if (value && !ObjectId.isValid(value)) {
      throw new Error('400');
    }
    return value ? new ObjectId(value) : undefined;
  }),
];
