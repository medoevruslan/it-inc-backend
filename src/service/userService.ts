import { InputUserType } from '../input-output-types/user-types';
import { userRepository } from '../repository/userRepository';
import { UserDbType } from '../db/user-db-type';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

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
      login,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    return { success: true, errors: null, value: await userRepository.create(newUser) };
  },
  async deleteById(userId: string) {
    if (!ObjectId.isValid(userId)) {
      throw new Error('400');
    }

    const success = await userRepository.deleteById(userId);

    if (!success) {
      throw new Error('404');
    }
    return success;
  },
  update() {},
};
