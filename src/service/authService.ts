import { InputLoginType } from '../input-output-types/auth-types';
import { userRepository } from '../repository/userRepository';
import bcrypt from 'bcrypt';
import { HttpStatuses } from '../shared/enums';

export const authService = {
  async login(input: InputLoginType) {
    const foundUser = await userRepository.findByLoginOrEmail(input.loginOrEmail);

    if (foundUser === null) {
      throw new Error(HttpStatuses.NotFound.toString());
    }

    const isValidPassword = await bcrypt.compare(input.password, foundUser.password);

    if (!isValidPassword) {
      return {
        success: false,
        errors: {
          errorsMessages: [
            { field: 'email', message: 'login or password is incorrect' },
            { field: 'password', message: 'login or password is incorrect' },
          ],
        },
        value: null,
      };
    }

    return { success: true, errors: null, value: null };
  },
};
