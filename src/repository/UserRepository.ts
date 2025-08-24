import { UserType } from '../db/user-db-type';
import { userMapper } from '../mapping/userMapper';
import { injectable } from 'inversify';
import { UserModel } from '../model/UserModel';

@injectable()
export class UserRepository {
  public async create(user: UserType) {
    const userModel = new UserModel(user)
    const result = await userModel.save()
    return result._id.toString();
  }

  public async findByLoginOrEmail(loginOrEmail: string) {
    return UserModel.findOne({ $or: [{ 'accountData.email': loginOrEmail }, { 'accountData.login': loginOrEmail }] }).lean();
  }

  public async findByConfirmationCode(code: string) {
    return UserModel.findOne({ 'emailConfirmation.confirmationCode': code }).lean();
  }

  public async findByPasswordRecoveryCode(code: string) {
    return UserModel.findOne({ 'passwordRecovery.recoveryCode': code }).lean();
  }

  public async findById(id: string) {
    const result = await UserModel.findById(id).lean();
    return result ? userMapper.mapUserToOutputType(result) : null;
  }

  public async deleteById(userId: string) {
    const result = await UserModel.findByIdAndDelete(userId);
    return result !== null
  }

  public async update(userId: string, update: Partial<UserType>) {
    const user = await UserModel.findById( userId);
    if (!user) return false
    Object.assign(user, update)

    await user.save()

    return true
  }
}
