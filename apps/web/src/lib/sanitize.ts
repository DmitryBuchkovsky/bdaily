import sanitize from "sanitize-html";

const ALLOWED_TAGS = [
  "b",
  "i",
  "u",
  "s",
  "em",
  "strong",
  "a",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "blockquote",
  "code",
  "pre",
  "p",
  "br",
  "span",
];

const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ["href", "target", "rel"],
  span: ["data-mention-id", "data-mention-name", "class", "data-type"],
};

export function sanitizeHtml(dirty: string): string {
  if (!dirty) return dirty;
  return sanitize(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRS,
    allowedSchemes: ["http", "https", "mailto"],
  });
}
