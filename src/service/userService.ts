import { InputUserType } from '../input-output-types/user-types';
import { HttpStatuses } from '../shared/enums';
import { userRepository } from '../repository/userRepository';
import { UserDbType } from '../db/user-db-type';
import bcrypt from 'bcrypt';

export const userService = {
  async create(user: InputUserType) {
    const { login, password, email } = user;
    const isAlreadyExists = await userRepository.findByLoginOrEmail(email);

    if (isAlreadyExists) {
      throw Error(HttpStatuses.BadRequest.toString());
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: UserDbType = {
      login,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    return userRepository.create(newUser);
  },
  update() {},
};
