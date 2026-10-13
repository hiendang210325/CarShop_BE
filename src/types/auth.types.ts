import { Role } from '../constants';

export interface User {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  avatarUrl?: string;
  role: Role;
  phone?: string;
  department?: string;
  isActive?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  createdAt: string;
  updatedAt?: string;
}

export type SafeUser = Omit<User, 'password' | 'resetPasswordToken' | 'resetPasswordExpires'>;

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: SafeUser;
  tokens: AuthTokens;
}
