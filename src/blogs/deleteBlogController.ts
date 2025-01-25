import { Request, Response } from 'express';
import { blogRepository } from '../repository';
import { ObjectId } from 'mongodb';

export const deleteBlogController = async (req: Request<{ id: string }>, res: Response) => {
  const blogId = req.params.id;

  const isValidId = ObjectId.isValid(blogId);

  if (!isValidId) {
    res.status(404).send();
    return;
  }

  const success = await blogRepository.deleteById(blogId);

  if (!success) {
    res.status(404).send();
    return;
  }
  res.status(204).send();
};
