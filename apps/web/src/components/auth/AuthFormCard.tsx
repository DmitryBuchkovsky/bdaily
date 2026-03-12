import { FormInput } from "@/components/ui/FormInput";
import { cn } from "@/lib/utils";
import type { UseAuthFormReturn } from "@/hooks/useAuthForm";

interface AuthFormCardProps {
  form: UseAuthFormReturn;
}

export function AuthFormCard({ form }: AuthFormCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      {form.error && (
        <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{form.error}</div>
      )}
      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-4">
        {!form.isLogin && (
          <>
            <FieldLabel label="Full name">
              <FormInput value={form.name} onChange={form.setName} placeholder="Jane Doe" />
            </FieldLabel>
            <FieldLabel label="Team ID">
              <FormInput value={form.teamId} onChange={form.setTeamId} placeholder="your-team-id" />
            </FieldLabel>
          </>
        )}
        <FieldLabel label="Email">
          <FormInput value={form.email} onChange={form.setEmail} placeholder="you@example.com" />
        </FieldLabel>
        <FieldLabel label="Password">
          <input type="password" value={form.password} onChange={(e) => form.setPassword(e.target.value)} required minLength={6} className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20" placeholder="••••••••" />
        </FieldLabel>
        <button type="submit" disabled={form.isLoading} className={cn("w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90", form.isLoading && "cursor-not-allowed opacity-60")}>
          {form.isLoading ? "Please wait..." : form.isLogin ? "Sign in" : "Create account"}
        </button>
      </form>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        {form.isLogin ? "Don't have an account? " : "Already have an account? "}
        <button onClick={form.toggleMode} className="font-medium text-primary hover:underline">
          {form.isLogin ? "Sign up" : "Sign in"}
        </button>
      </div>
    </div>
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1.5 block text-sm font-medium">{label}</label>{children}</div>;
}
