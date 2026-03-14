/**
 * Replaces {{variable}} placeholders in a template string with values.
 * Unresolved placeholders are left as-is.
 */
export function renderTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    key in variables ? variables[key]! : match,
  );
}
