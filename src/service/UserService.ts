import { InputUserType } from '../input-output-types/user-types';

import { UserDbType } from '../db/user-db-type';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { HttpStatuses } from '../shared/enums';
import { add } from 'date-fns';
import { v4 as uuidV4 } from 'uuid';
import { UserRepository } from '../repository/UserRepository';

export class UserService {

  constructor(protected userRepository: UserRepository) {
  }

  public async create(user: InputUserType) {
    const { login, password, email } = user;
    const isAlreadyExists = await this.userRepository.findByLoginOrEmail(email);

    if (isAlreadyExists) {
      return {
        success: false,
        errors: { errorsMessages: [{ field: 'email', message: 'email should be unique' }] },
        value: null,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: UserDbType = {
      accountData: {
        login,
        email,
        password: hashedPassword,
        createdAt: new Date(),
      },
      emailConfirmation: {
        isConfirmed: false,
        confirmationCode: uuidV4(),
        expirationDate: add(new Date(), { hours: 1 }),
      },
    };

    const createdUserId = await this.userRepository.create(newUser);

    return { success: true, errors: null, value: { id: createdUserId, ...newUser } };
  }

  public async deleteById(userId: string) {
    if (!ObjectId.isValid(userId)) {
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    const success = await this.userRepository.deleteById(userId);

    if (!success) {
      throw new Error(HttpStatuses.NotFound.toString());
    }
    return success;
  }


  public update() {
  }


}
