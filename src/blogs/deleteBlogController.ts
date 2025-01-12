import { Request, Response } from 'express';
import { blogRepository } from '../repository';

export const deleteBlogController = async (req: Request<{ blogId: string }>, res: Response) => {
  const blogId = req.params.blogId;

  const success = await blogRepository.deleteById(blogId);

  if (!success) {
    res.status(404).send();
    return;
  }
  res.status(204).send();
};
