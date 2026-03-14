import { describe, it, expect } from "vitest";
import { renderTemplate } from "../lib/template-engine.js";

describe("renderTemplate", () => {
  it("replaces a single variable", () => {
    expect(renderTemplate("Hello {{name}}", { name: "Alice" })).toBe("Hello Alice");
  });

  it("replaces multiple variables", () => {
    const result = renderTemplate("{{greeting}}, {{name}}!", {
      greeting: "Hi",
      name: "Bob",
    });
    expect(result).toBe("Hi, Bob!");
  });

  it("leaves unresolved placeholders as-is", () => {
    expect(renderTemplate("{{known}} and {{unknown}}", { known: "yes" })).toBe(
      "yes and {{unknown}}",
    );
  });

  it("handles empty variables object", () => {
    expect(renderTemplate("{{a}} {{b}}", {})).toBe("{{a}} {{b}}");
  });

  it("handles empty template string", () => {
    expect(renderTemplate("", { name: "Alice" })).toBe("");
  });

  it("handles template with no placeholders", () => {
    expect(renderTemplate("plain text", { name: "Alice" })).toBe("plain text");
  });

  it("handles variables with HTML special characters", () => {
    expect(renderTemplate("Hello {{name}}", { name: '<script>alert("xss")</script>' })).toBe(
      'Hello <script>alert("xss")</script>',
    );
  });

  it("handles variables with quotes", () => {
    expect(renderTemplate("Say {{msg}}", { msg: 'He said "hi"' })).toBe('Say He said "hi"');
  });
});
