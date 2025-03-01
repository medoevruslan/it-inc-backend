import { query } from 'express-validator';

const allowedSortByFields = ['name', 'description', 'websiteUrl', 'createdAt', 'isMembership'];
const allowedSortDirections = ['asc', 'desc'];

export const blogQueryValidator = [
  query('searchNameTerm').customSanitizer((value) => value || null),
  query('sortBy').customSanitizer((value) => (allowedSortByFields.includes(value) ? value : 'createdAt')),
  query('sortDirection').customSanitizer((value) => (allowedSortDirections.includes(value) ? value : 'desc')),
  query('pageSize').customSanitizer((value) =>
    isFinite(value) && Number(value) > 0 && Number(value) < 50 ? value : 10,
  ),
  query('pageNumber').customSanitizer((value) =>
    isFinite(value) && Number(value) > 0 && Number(value) < 999 ? value : 1,
  ),
];
