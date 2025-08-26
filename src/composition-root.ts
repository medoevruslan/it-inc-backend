import 'reflect-metadata';
import { UserRepository } from './repository/UserRepository';
import { RefreshTokenBlockedRepository } from './repository/RefreshTokenBlockedRepository';
import { DeviceAuthSessionsRepository } from './repository/DeviceAuthSessionsRepository';
import { DeviceSessionsService } from './service/DeviceSessionsService';
import { ApiRequestsSecurityQueryRepository } from './repository/ApiRequestsSecurityQueryRepository';
import { UserQueryRepository } from './repository/UserQueryRepository';
import { CommentRepository } from './repository/CommentRepository';
import { CommentService } from './service/CommentService';
import { PostService } from './service/PostService';
import { BlogRepository } from './repository/BlogRepository';
import { PostRepository } from './repository/PostRepository';
import { CommentQueryRepository } from './repository/CommentQueryRepository';
import { JwtService } from './service/JwtService';
import { PostsController } from './posts/PostsController';

import { Container } from 'inversify';
import { BlogController } from './blogs/BlogController';
import { BlogService } from './service/BlogService';
import { UsersController } from './users/UsersController';
import { UserService } from './service/UserService';
import { AuthController } from './auth/AuthController';
import { AuthService } from './service/AuthService';
import { EmailManager } from './managers/EmailManager';
import { EmailAdapter } from './adapters/EmailAdapter';
import { CommentsController } from './comments/CommentsController';
import { DeviceSessionsController } from './device-sessions/DeviceSessionsController';
import { Db } from './db/Database';
import { LikesInfoRepository } from './repository/LikesInfoRepository';

export const jwtService = new JwtService();

export const container = new Container();
export const db = new Db()

container.bind(PostsController).toSelf()
container.bind(BlogController).toSelf()
container.bind(UsersController).toSelf()
container.bind(AuthController).toSelf()
container.bind(CommentsController).toSelf()
container.bind(DeviceSessionsController).toSelf()

container.bind(PostService).toSelf()
container.bind(CommentService).toSelf()
container.bind(BlogService).toSelf()
container.bind(UserService).toSelf()
container.bind(AuthService).toSelf()
container.bind(JwtService).toSelf()
container.bind(DeviceSessionsService).toSelf()

container.bind(UserRepository).toSelf()
container.bind(CommentQueryRepository).toSelf()
container.bind(BlogRepository).toSelf()
container.bind(PostRepository).toSelf()
container.bind(CommentRepository).toSelf()
container.bind(UserQueryRepository).toSelf()
container.bind(ApiRequestsSecurityQueryRepository).toSelf()
container.bind(RefreshTokenBlockedRepository).toSelf()
container.bind(DeviceAuthSessionsRepository).toSelf()
container.bind(LikesInfoRepository).toSelf()

container.bind(EmailManager).toSelf()
container.bind(EmailAdapter).toSelf()

