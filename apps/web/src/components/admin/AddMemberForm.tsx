import { useState } from "react";
import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import { cn } from "@/lib/utils";

export interface AddMemberFormData {
  email: string;
  name: string;
  password: string;
  role: string;
}

interface AddMemberFormProps {
  onSubmit: (data: AddMemberFormData) => void;
  isLoading?: boolean;
}

const ROLE_OPTIONS = [
  { value: "MEMBER", label: "Member" },
  { value: "ADMIN", label: "Admin" },
];

export function AddMemberForm({ onSubmit, isLoading }: AddMemberFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("MEMBER");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, name, password, role });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Email</label>
        <FormInput value={email} onChange={setEmail} placeholder="user@example.com" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Name</label>
        <FormInput value={name} onChange={setName} placeholder="Full name" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min 6 characters"
          className={cn(
            "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20",
          )}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Role</label>
        <FormSelect value={role} onChange={setRole} options={ROLE_OPTIONS} />
      </div>
      <button
        type="submit"
        disabled={isLoading || !email || !name.trim() || password.length < 6}
        className={cn(
          "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
          (isLoading || !email || !name.trim() || password.length < 6) &&
            "cursor-not-allowed opacity-60",
        )}
      >
        {isLoading ? "Adding…" : "Add member"}
      </button>
    </form>
  );
}
