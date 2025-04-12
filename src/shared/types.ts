import { ResultStatus } from './enums';

export type Nullable<Type> = null | Type;

export type GetAllQueryParams<Model> = {
  searchNameTerm: string;
  sortBy: keyof Model;
  sortDirection: 'asc' | 'desc';
  pageNumber: string;
  pageSize: string;
};

type ExtensionType = {
  field: string | null;
  message: string;
};

export type Result<T = null> = {
  status: ResultStatus;
  errorMessage?: string;
  extensions: ExtensionType[];
  data: T;
};
