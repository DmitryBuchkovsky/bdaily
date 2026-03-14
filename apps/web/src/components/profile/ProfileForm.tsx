import { useState } from "react";
import { FormInput } from "@/components/ui/FormInput";

export interface ProfileFormData {
  name?: string;
}

interface ProfileFormProps {
  profile: {
    name: string;
  };
  onSubmit: (data: ProfileFormData) => void;
}

export function ProfileForm({ profile, onSubmit }: ProfileFormProps) {
  const [name, setName] = useState(profile.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name: name.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Name</label>
        <FormInput value={name} onChange={setName} placeholder="Your name" />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Save
      </button>
    </form>
  );
}
