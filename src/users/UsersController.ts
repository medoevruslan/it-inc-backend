import { Request, Response } from 'express';
import { GetAllUsersQueryParams, InputUserType } from '../input-output-types/user-types';
import { HttpStatuses } from '../shared/enums';
import { handleApiError } from '../shared/utils';
import { UserService } from '../service/UserService';
import { UserQueryRepository } from '../repository/UserQueryRepository';

export class UsersController {

  constructor(protected userService: UserService, protected userQueryRepository: UserQueryRepository) {
  }

  async getUsers(req: Request<{}, {}, {}, GetAllUsersQueryParams>, res: Response) {
    try {
      const usersInfo = await this.userQueryRepository.findAll(req.query);
      res.send(usersInfo);
    } catch (err) {
      handleApiError(err, res);
    }
  }

  async createUser(req: Request<{}, {}, InputUserType>, res: Response) {
    try {
      const created = await this.userService.create(req.body);
      if (!created.success && created.errors?.errorsMessages.length) {
        res.status(HttpStatuses.BadRequest).send(created.errors);
        return;
      }
      const createdUser = await this.userQueryRepository.findById(created.value!.id);
      res.status(HttpStatuses.Created).send(createdUser);
    } catch (err) {
      handleApiError(err, res);
    }
  }

  async deleteUser(req: Request<{ id: string }>, res: Response) {
    try {
      await this.userService.deleteById(req.params.id);
      res.sendStatus(HttpStatuses.NoContent);
    } catch (err) {
      handleApiError(err, res);
    }
  }

}