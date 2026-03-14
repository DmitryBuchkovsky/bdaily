import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
  useUpdateNotificationPrefs,
} from "@/hooks/useProfile";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { NotificationPrefsForm } from "@/components/notifications/NotificationPrefsForm";
import { PageInfoBlock } from "@/components/ui/PageInfoBlock";

interface NotificationPrefs {
  email: boolean;
  inApp: boolean;
  telegram: boolean;
  telegramChatId?: string;
}

export function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const updateNotificationPrefs = useUpdateNotificationPrefs();

  if (isLoading || !profile) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const prefs = (profile.notificationPreferences as NotificationPrefs) ?? {
    email: true,
    inApp: true,
    telegram: false,
    telegramChatId: "",
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Profile</h1>

      <PageInfoBlock
        storageKey="profile"
        title="Your Profile & Preferences"
        description="Manage your display name, password, and notification preferences from one place."
        tips={[
          "Change Password — update your login password (minimum 8 characters)",
          "Notifications — choose how you want to be notified: in-app or email",
          "Ticket system tokens are configured by your admin in Team Settings",
        ]}
      />

      <section className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Profile info</h2>
        <ProfileForm
          profile={{ name: profile.name }}
          onSubmit={(data) =>
            updateProfile.mutate(data as Parameters<typeof updateProfile.mutate>[0])
          }
        />
      </section>

      <section className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Change password</h2>
        <ChangePasswordForm
          onSubmit={(data) => changePassword.mutate(data)}
          isPending={changePassword.isPending}
          isSuccess={changePassword.isSuccess}
          error={changePassword.error}
        />
      </section>

      <section className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Notification preferences</h2>
        <NotificationPrefsForm
          prefs={prefs}
          onSave={(data) =>
            updateNotificationPrefs.mutate(
              data as unknown as Parameters<typeof updateNotificationPrefs.mutate>[0],
            )
          }
        />
      </section>
    </div>
  );
}
