import { NextResponse } from "next/server";
import {
  enquiryBudgets,
  enquiryServices,
  preferredContactMethods,
  type EnquiryData,
} from "@/lib/enquiry";

const recipient = "muforgetech@gmail.com";
const requestWindowMs = 15 * 60 * 1000;
const maxRequestsPerWindow = 5;
const requestTimesByIp = new Map<string, number[]>();

function jsonError(message: string, status: number, retryAfter?: number) {
  const response = NextResponse.json({ message }, { status });
  if (retryAfter) response.headers.set("Retry-After", String(retryAfter));
  return response;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<const Values extends readonly string[]>(
  values: Values,
  value: string,
): value is Values[number] {
  return values.some((candidate) => candidate === value);
}

function readString(value: unknown, maxLength: number) {
  return typeof value === "string" && value.length <= maxLength ? value.trim() : null;
}

function validateEnquiry(value: unknown): EnquiryData | null {
  if (!isRecord(value)) return null;

  const name = readString(value.name, 100);
  const email = readString(value.email, 254);
  const phone = readString(value.phone, 30);
  const company = readString(value.company ?? "", 120);
  const service = readString(value.service, 80);
  const budget = readString(value.budget ?? "", 40);
  const description = readString(value.description, 5000);
  const preferredContact = readString(value.preferredContact ?? "", 20);
  const website = readString(value.website ?? "", 200);

  if (
    name === null ||
    name.length < 2 ||
    email === null ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    phone === null ||
    !/^\+[1-9]\d{6,14}$/.test(phone.replace(/[\s().-]/g, "")) ||
    company === null ||
    service === null ||
    !isOneOf(enquiryServices, service) ||
    budget === null ||
    (budget !== "" && !isOneOf(enquiryBudgets, budget)) ||
    description === null ||
    description.trim().length < 10 ||
    preferredContact === null ||
    (preferredContact !== "" && !isOneOf(preferredContactMethods, preferredContact)) ||
    website === null
  ) {
    return null;
  }

  return {
    name,
    email,
    phone,
    company,
    service,
    budget,
    description,
    preferredContact,
    website,
  };
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const recentRequests = (requestTimesByIp.get(ip) ?? []).filter(
    (time) => now - time < requestWindowMs,
  );

  if (recentRequests.length >= maxRequestsPerWindow) {
    requestTimesByIp.set(ip, recentRequests);
    return Math.ceil((requestWindowMs - (now - recentRequests[0])) / 1000);
  }

  recentRequests.push(now);
  requestTimesByIp.set(ip, recentRequests);

  if (requestTimesByIp.size > 1000) {
    for (const [key, times] of requestTimesByIp) {
      if (times.every((time) => now - time >= requestWindowMs)) {
        requestTimesByIp.delete(key);
      }
    }
  }

  return 0;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonError("Send your enquiry using the website form.", 415);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 16_000) {
    return jsonError("The enquiry is too large. Please shorten the description.", 413);
  }

  const idempotencyKey = request.headers.get("idempotency-key") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(idempotencyKey)) {
    return jsonError("Please refresh the page and submit the enquiry again.", 400);
  }

  let bodyText: string;
  try {
    bodyText = await request.text();
  } catch {
    return jsonError("The enquiry could not be read. Please check the form and try again.", 400);
  }

  if (new TextEncoder().encode(bodyText).byteLength > 16_000) {
    return jsonError("The enquiry is too large. Please shorten the description.", 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return jsonError("The enquiry could not be read. Please check the form and try again.", 400);
  }

  const enquiry = validateEnquiry(body);
  if (!enquiry) {
    return jsonError("Please check the required details and submit the form again.", 400);
  }

  if (enquiry.website) {
    return jsonError("The enquiry could not be submitted. Please try again.", 400);
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
  const retryAfter = isRateLimited(ip);
  if (retryAfter) {
    return jsonError("Too many enquiries were submitted. Please try again shortly.", 429, retryAfter);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error("Enquiry email is not configured: RESEND_API_KEY or RESEND_FROM_EMAIL is missing.");
    return jsonError(
      "Enquiry email is not configured yet. Please contact us directly at muforgetech@gmail.com.",
      503,
    );
  }

  const submittedAt = new Date();
  const submittedAtText = submittedAt.toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "long",
    timeZone: "Asia/Kolkata",
  });
  const fields = [
    ["Full name", enquiry.name],
    ["Email address", enquiry.email],
    ["Phone number", enquiry.phone],
    ["Company", enquiry.company || "Not provided"],
    ["Service", enquiry.service],
    ["Project budget", enquiry.budget || "Not provided"],
    ["Preferred contact method", enquiry.preferredContact || "Not provided"],
    ["Submission date and time", submittedAtText],
  ] as const;
  const htmlFields = fields
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:8px 12px;border-bottom:1px solid #BFE3DC">${escapeHtml(label)}</th><td style="padding:8px 12px;border-bottom:1px solid #BFE3DC">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  const safeDescription = escapeHtml(enquiry.description).replace(/\n/g, "<br>");
  const textFields = fields.map(([label, value]) => `${label}: ${value}`).join("\n");

  try {
    const providerResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        reply_to: enquiry.email,
        subject: `New MuForge Website Enquiry — ${enquiry.service}`,
        html: `<h1>New MuForge website enquiry</h1><table style="border-collapse:collapse">${htmlFields}</table><h2>Project description</h2><p>${safeDescription}</p>`,
        text: `${textFields}\n\nProject description:\n${enquiry.description}`,
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });

    if (!providerResponse.ok) {
      console.error("Resend rejected a MuForge enquiry email.", {
        status: providerResponse.status,
      });
      return jsonError(
        "We could not send your enquiry right now. Please try again or email muforgetech@gmail.com.",
        502,
      );
    }

    let providerResult: unknown;
    try {
      providerResult = await providerResponse.json();
    } catch {
      console.error("Resend returned an unreadable response for a MuForge enquiry.");
      return jsonError(
        "We could not confirm that your enquiry was sent. Please try again or email muforgetech@gmail.com.",
        502,
      );
    }

    if (!isRecord(providerResult) || typeof providerResult.id !== "string") {
      console.error("Resend returned an unexpected response for a MuForge enquiry.");
      return jsonError(
        "We could not confirm that your enquiry was sent. Please try again or email muforgetech@gmail.com.",
        502,
      );
    }

    return NextResponse.json({ message: "Your enquiry has been sent successfully." });
  } catch (error) {
    console.error(
      error instanceof Error && error.name === "TimeoutError"
        ? "Resend timed out while processing a MuForge enquiry."
        : "Could not reach Resend while processing a MuForge enquiry.",
    );
    return jsonError(
      "We could not send your enquiry right now. Please try again or email muforgetech@gmail.com.",
      502,
    );
  }
}
