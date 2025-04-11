import { query } from 'express-validator';

const allowedSortByFields = ['login', 'email', 'createdAt'];
const allowedSortDirections = ['asc', 'desc'];

export const userQueryValidator = [
  query('searchLoginTerm').customSanitizer((value) => value || null),
  query('searchEmailTerm').customSanitizer((value) => value || null),
  query('sortBy').customSanitizer((value) => (allowedSortByFields.includes(value) ? value : 'createdAt')),
  query('sortDirection').customSanitizer((value) => (allowedSortDirections.includes(value) ? value : 'desc')),
  query('pageSize').customSanitizer((value) =>
    isFinite(value) && Number(value) > 0 && Number(value) < 50 ? value : 10,
  ),
  query('pageNumber').customSanitizer((value) =>
    isFinite(value) && Number(value) > 0 && Number(value) < 999 ? value : 1,
  ),
];
