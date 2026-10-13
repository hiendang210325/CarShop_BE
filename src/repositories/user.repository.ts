import { prisma } from '../database/prisma';
import { User, SafeUser } from '../types/auth.types';
import { Role } from '../constants';

export class UserRepository {
  async findAll(filter?: { search?: string; role?: string; isActive?: boolean }): Promise<SafeUser[]> {
    const where: Record<string, unknown> = {};
    if (filter?.search) {
      where.OR = [
        { fullName: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
        { phone: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    if (filter?.role && filter.role !== 'ALL') {
      where.role = filter.role;
    }
    if (filter?.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role as Role,
      department: u.department ?? undefined,
      phone: u.phone ?? undefined,
      avatarUrl: u.avatarUrl ?? undefined,
      isActive: u.isActive,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }));
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return {
      ...user,
      role: user.role as Role,
      department: user.department ?? undefined,
      phone: user.phone ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      isActive: user.isActive,
      resetPasswordToken: user.resetPasswordToken ?? undefined,
      resetPasswordExpires: user.resetPasswordExpires?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) return null;
    return {
      ...user,
      role: user.role as Role,
      department: user.department ?? undefined,
      phone: user.phone ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      isActive: user.isActive,
      resetPasswordToken: user.resetPasswordToken ?? undefined,
      resetPasswordExpires: user.resetPasswordExpires?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async findByResetToken(hashedToken: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: hashedToken },
    });
    if (!user) return null;
    return {
      ...user,
      role: user.role as Role,
      department: user.department ?? undefined,
      phone: user.phone ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      isActive: user.isActive,
      resetPasswordToken: user.resetPasswordToken ?? undefined,
      resetPasswordExpires: user.resetPasswordExpires?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async create(userData: User): Promise<User> {
    const created = await prisma.user.create({
      data: {
        id: userData.id,
        email: userData.email.toLowerCase(),
        password: userData.password!,
        fullName: userData.fullName,
        role: userData.role,
        department: userData.department,
        phone: userData.phone,
        avatarUrl: userData.avatarUrl,
        isActive: userData.isActive ?? true,
        resetPasswordToken: userData.resetPasswordToken ?? undefined,
        resetPasswordExpires: userData.resetPasswordExpires ? new Date(userData.resetPasswordExpires) : undefined,
      },
    });
    return {
      ...created,
      role: created.role as Role,
      department: created.department ?? undefined,
      phone: created.phone ?? undefined,
      avatarUrl: created.avatarUrl ?? undefined,
      isActive: created.isActive,
      resetPasswordToken: created.resetPasswordToken ?? undefined,
      resetPasswordExpires: created.resetPasswordExpires?.toISOString(),
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const data: Record<string, unknown> = {};
    if (updates.fullName !== undefined) data.fullName = updates.fullName;
    if (updates.password !== undefined) data.password = updates.password;
    if (updates.role !== undefined) data.role = updates.role;
    if (updates.department !== undefined) data.department = updates.department;
    if (updates.phone !== undefined) data.phone = updates.phone;
    if (updates.avatarUrl !== undefined) data.avatarUrl = updates.avatarUrl;
    if (updates.isActive !== undefined) data.isActive = updates.isActive;
    if ('resetPasswordToken' in updates) {
      data.resetPasswordToken = updates.resetPasswordToken ?? null;
    }
    if ('resetPasswordExpires' in updates) {
      data.resetPasswordExpires = updates.resetPasswordExpires
        ? new Date(updates.resetPasswordExpires)
        : null;
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
    });

    return {
      ...updated,
      role: updated.role as Role,
      department: updated.department ?? undefined,
      phone: updated.phone ?? undefined,
      avatarUrl: updated.avatarUrl ?? undefined,
      isActive: updated.isActive,
      resetPasswordToken: updated.resetPasswordToken ?? undefined,
      resetPasswordExpires: updated.resetPasswordExpires?.toISOString(),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  toSafeUser(user: User): SafeUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, resetPasswordToken, resetPasswordExpires, ...safeUser } = user;
    return safeUser;
  }
}

export const userRepository = new UserRepository();
