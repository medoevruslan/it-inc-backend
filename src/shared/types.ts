export type Nullable<Type> = null | Type;

export type GetAllQueryParams<Model> = {
  searchNameTerm: string;
  sortBy: keyof Model;
  sortDirection: 'asc' | 'desc';
  pageNumber: string;
  pageSize: string;
};
