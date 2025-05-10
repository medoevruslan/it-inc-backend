import { InputUserType } from '../input-output-types/user-types';
import { userRepository } from '../repository/userRepository';
import { UserDbType, UserType } from '../db/user-db-type';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { HttpStatuses } from '../shared/enums';
import { add } from 'date-fns';

export const userService = {
  async create(user: InputUserType) {
    const { login, password, email } = user;
    const isAlreadyExists = await userRepository.findByLoginOrEmail(email);

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
        confirmationCode: '',
        expirationDate: add(new Date(), { hours: 1 }),
      },
    };

    const createdUser = await userRepository.create(newUser);

    return { success: true, errors: null, value: createdUser };
  },
  async deleteById(userId: string) {
    if (!ObjectId.isValid(userId)) {
      throw new Error(HttpStatuses.BadRequest.toString());
    }

    const success = await userRepository.deleteById(userId);

    if (!success) {
      throw new Error(HttpStatuses.NotFound.toString());
    }
    return success;
  },
  update() {
  },
};
