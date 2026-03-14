import { useState } from "react";
import { Toggle } from "@/components/ui/Toggle";

interface NotificationPrefs {
  email: boolean;
  inApp: boolean;
  telegram: boolean;
  telegramChatId?: string;
}

interface NotificationPrefsFormProps {
  prefs: NotificationPrefs;
  onSave: (data: NotificationPrefs) => void;
}

export function NotificationPrefsForm({ prefs, onSave }: NotificationPrefsFormProps) {
  const [email, setEmail] = useState(prefs.email);
  const [inApp, setInApp] = useState(prefs.inApp);
  const [telegram] = useState(prefs.telegram);
  const [telegramChatId] = useState(prefs.telegramChatId ?? "");

  const handleSave = () => {
    onSave({ email, inApp, telegram, telegramChatId: telegram ? telegramChatId : undefined });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
      className="space-y-4"
    >
      <Toggle label="Email notifications" checked={email} onChange={setEmail} />
      <Toggle label="In-app notifications" checked={inApp} onChange={setInApp} />
      {/* Telegram notifications — hidden until integration is fully configured
      <Toggle label="Telegram notifications" checked={telegram} onChange={setTelegram} />
      {telegram && (
        <div>
          <label className="mb-1.5 block text-sm font-medium">Telegram Chat ID</label>
          <FormInput value={telegramChatId} onChange={setTelegramChatId} placeholder="e.g. 123456789" />
        </div>
      )}
      */}
      <button
        type="submit"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Save
      </button>
    </form>
  );
}
