import { Router } from 'express';
import { postBodyValidator } from '../validation';
import { validationErrorMiddleware } from '../middlewares';
import { postQueryValidator } from '../validation/postQueryValidator';
import { accessTokenGuard, baseAuthGuard } from '../middlewares/guard';
import { commentsQueryValidator } from '../validation/commentQueryValidator';
import { commentBodyValidator } from '../validation/commentBodyValidator';
import { postsController } from '../composition-root';

export const postsRouter = Router();

postsRouter.get('/', postQueryValidator, postsController.getPosts.bind(postsController));
postsRouter.get('/:id', postsController.getPostById.bind(postsController));
postsRouter.post('/', postBodyValidator, baseAuthGuard, validationErrorMiddleware, postsController.createPost.bind(postsController));
postsRouter.put('/:id', postBodyValidator, baseAuthGuard, validationErrorMiddleware, postsController.updatePost.bind(postsController));
postsRouter.delete('/:id', baseAuthGuard, postsController.deletePost.bind(postsController));
postsRouter.post('/:postId/comments', commentBodyValidator, accessTokenGuard, validationErrorMiddleware, postsController.createPostComments.bind(postsController));
postsRouter.get('/:postId/comments', commentsQueryValidator,  postsController.getPostComments.bind(postsController));
