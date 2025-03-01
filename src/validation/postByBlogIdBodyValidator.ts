import { body } from 'express-validator';
import { blogRepository } from '../repository';
import { postBodyValidator } from './postBodyValidator';

export const postByBlogIdBodyValidator = postBodyValidator.slice(0, -1); // remove blogId validation
