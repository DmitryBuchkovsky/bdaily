import type { Transporter } from "nodemailer";
import type { EmailTemplateRepository } from "../repositories/email-template.repository.js";
import { renderTemplate } from "../lib/template-engine.js";

export class EmailService {
  constructor(
    private readonly transporter: Transporter | null,
    private readonly templateRepo: EmailTemplateRepository,
    private readonly fromAddress: string,
    private readonly appUrl: string,
    private readonly appName: string = "BDaily",
  ) {}

  async sendTemplated(to: string, slug: string, variables: Record<string, string>): Promise<void> {
    if (!this.transporter) return;

    const template = await this.templateRepo.findBySlug(slug);
    if (!template) {
      console.error(`Email template "${slug}" not found, skipping send`);
      return;
    }

    const vars: Record<string, string> = {
      appUrl: this.appUrl,
      appName: this.appName,
      ...variables,
    };

    const subject = renderTemplate(template.subject, vars);
    const html = renderTemplate(template.bodyHtml, vars);

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        html,
      });
    } catch (err) {
      console.error(`Failed to send "${slug}" email to ${to}:`, err);
    }
  }

  async sendRaw(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) return;
    try {
      await this.transporter.sendMail({ from: this.fromAddress, to, subject, html });
    } catch (err) {
      console.error(`Failed to send email to ${to}:`, err);
    }
  }
}
