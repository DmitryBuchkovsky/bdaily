import { useState } from "react";
import { Mail, Pencil, X, Eye, Code, Info } from "lucide-react";
import { PageInfoBlock } from "@/components/ui/PageInfoBlock";
import {
  useEmailTemplates,
  useUpdateEmailTemplate,
  type EmailTemplate,
} from "@/hooks/useEmailTemplates";
import { cn } from "@/lib/utils";

export function EmailTemplatesPage() {
  const { data: templates, isLoading } = useEmailTemplates();
  const [editing, setEditing] = useState<EmailTemplate | null>(null);

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Loading templates...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <PageInfoBlock
        storageKey="admin-email-templates"
        title="Email Templates"
        description="Manage the email templates sent by the system. Edit the subject line and HTML body to match your organization's voice and branding."
        tips={[
          "Use {{variable}} placeholders — each template lists its available variables",
          "Changes take effect immediately for all future emails",
          "The slug identifies the template internally and cannot be changed",
        ]}
      />

      <div className="flex items-center gap-3">
        <Mail className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Email Templates</h1>
      </div>

      <div className="space-y-3">
        {templates?.map((t) => (
          <TemplateCard key={t.id} template={t} onEdit={() => setEditing(t)} />
        ))}
      </div>

      {editing && <EditTemplateModal template={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function TemplateCard({ template, onEdit }: { template: EmailTemplate; onEdit: () => void }) {
  const [preview, setPreview] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{template.name}</h3>
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
              {template.slug}
            </span>
          </div>
          {template.description && (
            <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
          )}
          <p className="mt-2 text-sm">
            <span className="font-medium text-muted-foreground">Subject:</span> {template.subject}
          </p>
          {template.variables.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {template.variables.map((v) => (
                <span
                  key={v}
                  className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-mono text-primary"
                >
                  {`{{${v}}}`}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setPreview((p) => !p)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            title={preview ? "Hide preview" : "Show preview"}
          >
            {preview ? <Code className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            onClick={onEdit}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            title="Edit template"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      </div>
      {preview && (
        <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: template.bodyHtml }}
          />
        </div>
      )}
    </div>
  );
}

function EditTemplateModal({
  template,
  onClose,
}: {
  template: EmailTemplate;
  onClose: () => void;
}) {
  const updateMutation = useUpdateEmailTemplate();
  const [subject, setSubject] = useState(template.subject);
  const [bodyHtml, setBodyHtml] = useState(template.bodyHtml);
  const [description, setDescription] = useState(template.description ?? "");
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    try {
      await updateMutation.mutateAsync({
        id: template.id,
        subject,
        bodyHtml,
        description: description || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Edit: {template.name}</h2>
            <span className="text-xs font-mono text-muted-foreground">{template.slug}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {template.variables.length > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-info/10 p-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Available variables: </span>
                {template.variables.map((v) => (
                  <code
                    key={v}
                    className="mx-0.5 rounded bg-muted px-1 py-0.5 text-xs"
                  >{`{{${v}}}`}</code>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="What this template is for"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Subject line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <label className="text-sm font-medium">Email body (HTML)</label>
              <div className="flex rounded-lg border border-border text-xs">
                <button
                  onClick={() => setTab("edit")}
                  className={cn(
                    "rounded-l-lg px-3 py-1",
                    tab === "edit"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  Code
                </button>
                <button
                  onClick={() => setTab("preview")}
                  className={cn(
                    "rounded-r-lg px-3 py-1",
                    tab === "preview"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  Preview
                </button>
              </div>
            </div>

            {tab === "edit" ? (
              <textarea
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                rows={16}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs leading-relaxed outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            ) : (
              <div className="rounded-lg border border-border bg-white p-4">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className={cn(
              "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
              updateMutation.isPending && "cursor-not-allowed opacity-60",
            )}
          >
            {updateMutation.isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
