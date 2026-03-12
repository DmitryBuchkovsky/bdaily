import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useAuthForm } from "@/hooks/useAuthForm";
import { AuthFormCard } from "@/components/auth/AuthFormCard";

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  const form = useAuthForm(() => navigate(from, { replace: true }));

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            B
          </div>
          <h1 className="text-2xl font-bold">Welcome to BDaily</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {form.isLogin ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>
        <AuthFormCard form={form} />
      </div>
    </div>
  );
}
