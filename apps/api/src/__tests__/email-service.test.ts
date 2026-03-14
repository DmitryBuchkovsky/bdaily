import { describe, it, expect, vi, beforeEach } from "vitest";
import type { EmailTemplate } from "@prisma/client";
import { EmailService } from "../services/email.service.js";
import type { EmailTemplateRepository } from "../repositories/email-template.repository.js";

function mockTemplate(overrides: Partial<EmailTemplate> = {}): EmailTemplate {
  return {
    id: "tpl-1",
    slug: "invite",
    name: "Invite",
    subject: "Welcome to {{appName}}",
    bodyHtml: "<p>Hello {{name}}, visit {{appUrl}}</p>",
    description: "Invite email",
    variables: ["name", "appUrl", "appName"],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function createMocks(transporterOverride?: null) {
  const transporter =
    transporterOverride === null
      ? null
      : { sendMail: vi.fn().mockResolvedValue({ messageId: "msg-1" }) };

  const templateRepo: EmailTemplateRepository = {
    findAll: vi.fn(),
    findBySlug: vi.fn(),
    update: vi.fn(),
  };

  const service = new EmailService(
    transporter as never,
    templateRepo,
    "noreply@example.com",
    "https://app.example.com",
    "BDaily",
  );

  return { transporter, templateRepo, service };
}

describe("EmailService", () => {
  let transporter: { sendMail: ReturnType<typeof vi.fn> } | null;
  let templateRepo: EmailTemplateRepository;
  let service: EmailService;

  beforeEach(() => {
    vi.clearAllMocks();
    ({ transporter, templateRepo, service } = createMocks());
  });

  describe("sendTemplated", () => {
    it("looks up template, renders variables, sends via transporter", async () => {
      vi.mocked(templateRepo.findBySlug).mockResolvedValue(mockTemplate());

      await service.sendTemplated("bob@example.com", "invite", {
        name: "Bob",
      });

      expect(templateRepo.findBySlug).toHaveBeenCalledWith("invite");
      expect(transporter!.sendMail).toHaveBeenCalledWith({
        from: "noreply@example.com",
        to: "bob@example.com",
        subject: "Welcome to BDaily",
        html: "<p>Hello Bob, visit https://app.example.com</p>",
      });
    });

    it("skips send when transporter is null", async () => {
      ({ transporter, templateRepo, service } = createMocks(null));

      await service.sendTemplated("bob@example.com", "invite", {
        name: "Bob",
      });

      expect(templateRepo.findBySlug).not.toHaveBeenCalled();
    });

    it("skips send when template not found", async () => {
      vi.mocked(templateRepo.findBySlug).mockResolvedValue(null);
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await service.sendTemplated("bob@example.com", "missing", {});

      expect(transporter!.sendMail).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('"missing" not found'));
      errorSpy.mockRestore();
    });

    it("injects appUrl and appName automatically", async () => {
      vi.mocked(templateRepo.findBySlug).mockResolvedValue(
        mockTemplate({
          subject: "From {{appName}}",
          bodyHtml: "Visit {{appUrl}}",
        }),
      );

      await service.sendTemplated("bob@example.com", "invite", {});

      expect(transporter!.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: "From BDaily",
          html: "Visit https://app.example.com",
        }),
      );
    });

    it("caller variables override defaults", async () => {
      vi.mocked(templateRepo.findBySlug).mockResolvedValue(
        mockTemplate({
          subject: "{{appName}}",
          bodyHtml: "{{appUrl}}",
        }),
      );

      await service.sendTemplated("bob@example.com", "invite", {
        appName: "CustomApp",
        appUrl: "https://custom.example.com",
      });

      expect(transporter!.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: "CustomApp",
          html: "https://custom.example.com",
        }),
      );
    });
  });

  describe("sendRaw", () => {
    it("sends raw email", async () => {
      await service.sendRaw("bob@example.com", "Test Subject", "<p>hi</p>");

      expect(transporter!.sendMail).toHaveBeenCalledWith({
        from: "noreply@example.com",
        to: "bob@example.com",
        subject: "Test Subject",
        html: "<p>hi</p>",
      });
    });

    it("skips when transporter is null", async () => {
      ({ transporter, templateRepo, service } = createMocks(null));

      await service.sendRaw("bob@example.com", "Subject", "<p>hi</p>");

      expect(transporter).toBeNull();
    });
  });
});
