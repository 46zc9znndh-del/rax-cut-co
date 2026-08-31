import "server-only";

import { Resend } from "resend";
import { SITE_DOMAIN } from "@/lib/site";
import { getEmailConfig } from "@/lib/email/config";

export type ResendDnsRecord = {
  type: string;
  name: string;
  value: string;
  status?: string;
  priority?: number;
};

export async function getResendDomainStatus() {
  const { apiKey } = getEmailConfig();
  if (!apiKey) {
    return {
      configured: false,
      domain: SITE_DOMAIN,
      status: "missing_api_key" as const,
      records: [] as ResendDnsRecord[],
    };
  }

  const resend = new Resend(apiKey);
  const domains = await resend.domains.list();
  let domain = domains.data?.data?.find((entry) => entry.name === SITE_DOMAIN);

  if (!domain) {
    const created = await resend.domains.create({ name: SITE_DOMAIN, region: "us-east-1" });
    if (created.error) {
      throw new Error(created.error.message);
    }
    domain = created.data;
  }

  const detail = domain?.id ? await resend.domains.get(domain.id) : null;
  const records =
    detail?.data?.records?.map((record) => ({
      type: record.type,
      name: record.name,
      value: record.value,
      status: record.status,
      priority: "priority" in record ? record.priority : undefined,
    })) ?? [];

  return {
    configured: true,
    domain: SITE_DOMAIN,
    domainId: domain?.id,
    status: detail?.data?.status ?? domain?.status ?? "unknown",
    records,
    useDevFrom: process.env.RESEND_USE_DEV_FROM === "true",
    fromEmail: process.env.RESEND_FROM_EMAIL,
    adminEmail: process.env.RESEND_ADMIN_EMAIL,
    replyToEmail: process.env.RESEND_REPLY_TO_EMAIL,
  };
}

export async function verifyResendDomain() {
  const status = await getResendDomainStatus();
  if (!status.domainId) {
    throw new Error("Resend domain is not configured.");
  }

  const resend = new Resend(getEmailConfig().apiKey!);
  const result = await resend.domains.verify(status.domainId);
  if (result.error) {
    throw new Error(result.error.message);
  }

  return getResendDomainStatus();
}
