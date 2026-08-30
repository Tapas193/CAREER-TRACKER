import { userRepo } from '../repositories/userRepo';
import { comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/http';
import { AuthUser } from '../types';

export interface LoginInput {
  email: string;
  password: string;
}

export const authService = {
  async login({ email, password }: LoginInput): Promise<{ token: string; user: any }> {
    const user = await userRepo.validateLogin(email);
    if (!user) {
      throw new AppError('Invalid credentials or account is not active', 401);
    }
    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      throw new AppError('Invalid credentials', 401);
    }

    const authUser: AuthUser = {
      userId: user.id,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
    };
    const token = signToken(authUser);

    const { passwordHash: _passwordHash, ...safeUser } = user;
    return { token, user: safeUser };
  },
};
