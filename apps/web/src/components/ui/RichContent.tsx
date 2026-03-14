import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

interface RichContentProps {
  html: string;
  className?: string;
}

const MENTION_STYLES =
  "[&_[data-type='mention']]:inline-flex [&_[data-type='mention']]:items-center [&_[data-type='mention']]:rounded [&_[data-type='mention']]:bg-primary/10 [&_[data-type='mention']]:px-1 [&_[data-type='mention']]:text-sm [&_[data-type='mention']]:font-medium [&_[data-type='mention']]:text-primary";

export function RichContent({ html, className }: RichContentProps) {
  const sanitized = sanitizeHtml(html);
  return (
    <div
      className={cn("prose prose-sm max-w-none", MENTION_STYLES, className)}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
