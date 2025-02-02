import { Request, Response } from 'express';
import { blogRepository } from '../repository';
import { BlogType, OutputBlogType } from '../input-output-types/blog-types';
import { blogService } from '../service/blogService';
import { BlogDbType } from '../db/blog-db-type';
import { SortDirection } from 'mongodb';

export type AllBlogsQueryParams = {
  searchNameTerm: string;
  sortBy: keyof BlogType;
  sortDirection: 'asc' | 'desc';
  pageNumber: number;
  pageSize: number;
};

export const getBlogsController = async (req: Request<{}, {}, {}, AllBlogsQueryParams>, res: Response) => {
  try {
    const blogs = await blogService.findAll(req.query);
    res.send(blogs);
  } catch (err: unknown) {
    const error = err as Error;
    const errorCode = Number(error.message);
    if (!isNaN(errorCode)) {
      res.status(errorCode).send();
    } else {
      res.status(500).send(error.message);
    }
  }
};
