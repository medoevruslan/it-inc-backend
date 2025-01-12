import { body } from 'express-validator';
import { blogRepository } from '../repository';

export const postBodyValidator = [
  body('title')
    .isString()
    .withMessage('[title] should be a string')
    .trim()
    .notEmpty()
    .withMessage('required')
    .isLength({ max: 30 })
    .withMessage('title should be less than 30 chars'),
  body('shortDescription')
    .isString()
    .withMessage('[shortDescription] should be a string')
    .trim()
    .notEmpty()
    .withMessage('required')
    .isLength({ max: 100 })
    .withMessage('shortDescription should be less than 100 chars'),

  body('content')
    .isString()
    .withMessage('[content] should be a string')
    .trim()
    .notEmpty()
    .withMessage('required')
    .isLength({ max: 1000 })
    .withMessage('content should be less than 1000 chars'),
  body('blogId')
    .isString()
    .withMessage('[blogId] should be a string')
    .trim()
    .notEmpty()
    .withMessage('required')
    .custom(async (value) => {
      const blog = await blogRepository.findById(value);
      if (blog === null) {
        throw new Error('blog is not found');
      }
      return true;
    }),
];
