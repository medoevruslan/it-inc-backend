import { Request, Response } from 'express';
import { blogRepository } from '../repository';
import { ObjectId } from 'mongodb';

export const deleteBlogController = async (req: Request<{ id: string }>, res: Response) => {
  const blogId = req.params.id;

  if (!ObjectId.isValid(blogId)) {
    res.status(400).send();
    return;
  }

  const success = await blogRepository.deleteById(blogId);

  if (!success) {
    res.status(404).send();
    return;
  }
  res.status(204).send();
};
