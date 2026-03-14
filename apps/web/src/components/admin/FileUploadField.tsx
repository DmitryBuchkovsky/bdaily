import { useRef } from "react";
import { Upload, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadFieldProps {
  label: string;
  hint: string;
  currentUrl: string | null;
  onUpload: (file: File) => void;
  onDelete: () => void;
  isUploading: boolean;
}

export function FileUploadField({
  label,
  hint,
  currentUrl,
  onUpload,
  onDelete,
  isUploading,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = "";
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <p className="mb-3 text-xs text-muted-foreground">{hint}</p>

      {currentUrl ? (
        <div className="flex items-center gap-3">
          <img
            src={currentUrl}
            alt={label}
            className="h-16 w-16 rounded-lg border border-border object-contain bg-white p-1"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium",
                "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                isUploading && "opacity-60",
              )}
            >
              <Upload className="h-3.5 w-3.5" />
              Replace
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "flex h-24 w-full items-center justify-center rounded-xl border-2 border-dashed border-border",
            "text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary",
            isUploading && "opacity-60",
          )}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? "Uploading…" : `Upload ${label.toLowerCase()}`}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
