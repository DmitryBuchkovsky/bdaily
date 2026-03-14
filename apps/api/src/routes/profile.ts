import type { FastifyInstance } from "fastify";
import {
  updateProfileSchema,
  changePasswordSchema,
  notificationPreferenceSchema,
} from "@bdaily/shared";
import { authenticate } from "../middleware/auth.js";
import type { UserService } from "../services/user.service.js";
import type { NotificationPreferenceRepository } from "../repositories/notification.repository.js";

export function profileRoutes(
  userService: UserService,
  prefRepo: NotificationPreferenceRepository,
) {
  return async function (app: FastifyInstance): Promise<void> {
    app.addHook("preHandler", authenticate);

    app.get("/", async (request) => {
      const user = await userService.getProfile(request.user.sub);
      const prefs = await prefRepo.findByUserId(request.user.sub);
      return {
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          teamId: user.teamId,
          notificationPreferences: prefs ?? {
            email: true,
            inApp: true,
            telegram: false,
            telegramChatId: null,
          },
        },
      };
    });

    app.put("/", async (request) => {
      const input = updateProfileSchema.parse(request.body);
      const user = await userService.updateProfile(request.user.sub, input);
      return {
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          teamId: user.teamId,
        },
      };
    });

    app.put("/password", async (request) => {
      const input = changePasswordSchema.parse(request.body);
      await userService.changePassword(request.user.sub, input.currentPassword, input.newPassword);
      return { data: { message: "Password updated successfully" } };
    });

    app.put("/notifications", async (request) => {
      const input = notificationPreferenceSchema.parse(request.body);
      const prefs = await prefRepo.upsert(request.user.sub, input);
      return { data: prefs };
    });
  };
}
