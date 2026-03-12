import { cn } from "@/lib/utils";

interface FormInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "date";
  className?: string;
}

export function FormInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className,
}: FormInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20",
        className,
      )}
    />
  );
}
