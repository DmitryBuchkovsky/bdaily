import { useState } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChangePasswordFormProps {
  onSubmit: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => void;
  isPending: boolean;
  isSuccess: boolean;
  error: Error | null;
}

export function ChangePasswordForm({
  onSubmit,
  isPending,
  isSuccess,
  error,
}: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (newPassword.length < 8) {
      setLocalError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    onSubmit({ currentPassword, newPassword, confirmPassword });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const displayError =
    localError ||
    (error ? ((error as { message?: string }).message ?? "Failed to change password") : "");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordField
        label="Current password"
        value={currentPassword}
        onChange={setCurrentPassword}
        visible={showCurrent}
        onToggle={() => setShowCurrent((v) => !v)}
      />
      <PasswordField
        label="New password"
        value={newPassword}
        onChange={setNewPassword}
        visible={showNew}
        onToggle={() => setShowNew((v) => !v)}
        hint="At least 8 characters"
      />
      <PasswordField
        label="Confirm new password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        visible={showNew}
        onToggle={() => setShowNew((v) => !v)}
      />

      {displayError && <p className="text-sm text-destructive">{displayError}</p>}
      {isSuccess && !displayError && (
        <p className="flex items-center gap-1 text-sm text-success">
          <Check className="h-4 w-4" /> Password changed successfully
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !currentPassword || !newPassword || !confirmPassword}
        className={cn(
          "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
          (isPending || !currentPassword) && "opacity-60",
        )}
      >
        {isPending ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  visible: boolean;
  onToggle: () => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full rounded-lg border bg-background px-3 py-2 pr-10 text-sm",
            "outline-none focus:border-primary focus:ring-1 focus:ring-primary",
          )}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
          tabIndex={-1}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
