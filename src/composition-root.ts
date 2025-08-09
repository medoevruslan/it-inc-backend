import { EmailAdapter } from './adapters/EmailAdapter';
import { UserRepository } from './repository/UserRepository';
import { UserService } from './service/UserService';
import { AuthService } from './service/AuthService';
import { EmailManager } from './managers/EmailManager';
import { RefreshTokenBlockedRepository } from './repository/RefreshTokenBlockedRepository';
import { DeviceAuthSessionsRepository } from './repository/DeviceAuthSessionsRepository';
import { DeviceSessionsService } from './service/DeviceSessionsService';
import { ApiRequestsSecurityQueryRepository } from './repository/ApiRequestsSecurityQueryRepository';
import { AuthController } from './auth/AuthController';
import { UserQueryRepository } from './repository/UserQueryRepository';
import { CommentRepository } from './repository/CommentRepository';
import { CommentService } from './service/CommentService';
import { PostService } from './service/PostService';
import { BlogRepository } from './repository/BlogRepository';
import { PostRepository } from './repository/PostRepository';
import { BlogService } from './service/BlogService';
import { CommentQueryRepository } from './repository/CommentQueryRepository';
import { JwtService } from './service/JwtService';
import { BlogController } from './blogs/BlogController';
import { CommentsController } from './comments/CommentsController';
import { DeviceSessionsController } from './device-sessions/DeviceSessionsController';
import { PostsController } from './posts/PostsController';
import { UsersController } from './users/UsersController';

const userRepository = new UserRepository();
const emailAdapter = new EmailAdapter();
const emailManager = new EmailManager(emailAdapter);

export const userService = new UserService(userRepository);
export const jwtService = new JwtService();

const refreshTokensBlockedRepository = new RefreshTokenBlockedRepository();
const deviceAuthSessionsRepository = new DeviceAuthSessionsRepository();
export const userQueryRepository = new UserQueryRepository();
const commentRepository = new CommentRepository();
export const blogRepository = new BlogRepository();
export const postRepository = new PostRepository();
export const commentQueryRepository = new CommentQueryRepository();

export const apiRequestsSecurityQueryRepository = new ApiRequestsSecurityQueryRepository();

export const blogService = new BlogService(postRepository, blogRepository);
export const postService = new PostService(blogRepository, postRepository);
export const commentService = new CommentService(postService, commentRepository, userQueryRepository);
export const deviceSessionsService = new DeviceSessionsService(deviceAuthSessionsRepository, jwtService);
export const authService = new AuthService(emailManager, userService, userRepository, jwtService, refreshTokensBlockedRepository, deviceSessionsService);

export const authController = new AuthController(authService, userQueryRepository);
export const blogController = new BlogController(blogService, postService)
export const commentsController = new CommentsController(commentService, commentQueryRepository)
export const deviceSessionsController = new DeviceSessionsController(deviceSessionsService)
export const postsController = new PostsController(postService, commentService, commentQueryRepository)
export const usersController = new UsersController(userService, userQueryRepository)