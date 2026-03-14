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

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "target", "rel"],
  span: ["data-mention-id", "data-mention-name", "class", "data-type"],
};

export function sanitizeHtml(dirty: string): string {
  if (!dirty) return dirty;
  return sanitize(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
  });
}

export function sanitizeFields<T extends Record<string, unknown>>(obj: T, fields: (keyof T)[]): T {
  const result = { ...obj };
  for (const field of fields) {
    const val = result[field];
    if (typeof val === "string") {
      (result as Record<string, unknown>)[field as string] = sanitizeHtml(val);
    }
  }
  return result;
}
