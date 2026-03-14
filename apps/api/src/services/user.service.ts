import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import type { UserRepository } from "../repositories/user.repository.js";
import type { EmailService } from "./email.service.js";
import { ConflictError, NotFoundError, ValidationError } from "../middleware/error-handler.js";

const SALT_ROUNDS = 12;

interface AddMemberInput {
  email: string;
  name: string;
  password: string;
  role?: "ADMIN" | "MEMBER";
  teamId: string;
}

interface UpdateMemberInput {
  name?: string;
  role?: "ADMIN" | "MEMBER";
  teamId?: string;
}

interface UpdateProfileInput {
  name?: string;
}

export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly emailService: EmailService | null = null,
  ) {}

  async getTeamMembers(teamId: string): Promise<User[]> {
    return this.userRepo.findByTeamId(teamId);
  }

  async addMember(input: AddMemberInput): Promise<User> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) throw new ConflictError("A user with this email already exists");

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await this.userRepo.create({
      email: input.email,
      name: input.name,
      passwordHash,
      teamId: input.teamId,
      role: input.role,
    });

    await this.emailService?.sendTemplated(user.email, "invite", {
      name: user.name,
      email: user.email,
      password: input.password,
    });

    return user;
  }

  async updateMember(id: string, input: UpdateMemberInput): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return this.userRepo.update(id, input);
  }

  async setActive(id: string, isActive: boolean): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return this.userRepo.update(id, { isActive });
  }

  async removeMember(id: string): Promise<void> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError("User not found");
    await this.userRepo.delete(id);
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return this.userRepo.update(userId, input);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new ValidationError("Current password is incorrect");

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.userRepo.update(userId, { passwordHash });
  }
}
