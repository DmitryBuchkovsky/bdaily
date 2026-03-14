import type { PrismaClient, EmailTemplate } from "@prisma/client";

interface UpdateTemplateData {
  name?: string;
  subject?: string;
  bodyHtml?: string;
  description?: string;
}

export interface EmailTemplateRepository {
  findAll(): Promise<EmailTemplate[]>;
  findBySlug(slug: string): Promise<EmailTemplate | null>;
  update(id: string, data: UpdateTemplateData): Promise<EmailTemplate>;
}

export class PrismaEmailTemplateRepository implements EmailTemplateRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(): Promise<EmailTemplate[]> {
    return this.db.emailTemplate.findMany({ orderBy: { slug: "asc" } });
  }

  async findBySlug(slug: string): Promise<EmailTemplate | null> {
    return this.db.emailTemplate.findUnique({ where: { slug } });
  }

  async update(id: string, data: UpdateTemplateData): Promise<EmailTemplate> {
    return this.db.emailTemplate.update({ where: { id }, data });
  }
}
