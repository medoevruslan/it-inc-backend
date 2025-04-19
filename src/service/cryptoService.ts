import bcrypt from 'bcrypt';

export const cryptoService = {
  async genHash(password: string, salt: number | string = 10) {
    return await bcrypt.hash(password, salt);
  },
  async genSalt(rounds = 10) {
    return await bcrypt.genSalt(rounds);
  },
  async comparePass(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  },
};
