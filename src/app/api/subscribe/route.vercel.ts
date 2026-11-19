import { NextRequest, NextResponse } from "next/server";

const BUTTONDOWN_API_KEY = process.env.EMAIL_SERVICE_API_KEY;
const BUTTONDOWN_API = "https://api.buttondown.com/v1/subscribers";

// Simple in-memory rate limiting
const rateMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const window = 60_000; // 1 minute
  const maxRequests = 5;

  const timestamps = rateMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < window);
  rateMap.set(ip, recent);

  if (recent.length >= maxRequests) return true;
  recent.push(now);
  return false;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { status: "error", message: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: "error", message: "Invalid request body." },
      { status: 400 }
    );
  }

  const email = body.email?.trim();
  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { status: "error", message: "Invalid email address." },
      { status: 400 }
    );
  }

  if (!BUTTONDOWN_API_KEY) {
    console.error("EMAIL_SERVICE_API_KEY is not configured");
    return NextResponse.json(
      { status: "error", message: "Email service is not configured." },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(BUTTONDOWN_API, {
      method: "POST",
      headers: {
        Authorization: `Token ${BUTTONDOWN_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        type: "unactivated", // triggers double opt-in
      }),
    });

    if (res.status === 201) {
      return NextResponse.json({ status: "ok" });
    }

    // Buttondown returns 400 with a code for existing subscribers
    if (res.status === 400) {
      const data = await res.json();
      const detail = Array.isArray(data) ? data[0] : data.detail || "";
      const msg = typeof detail === "string" ? detail.toLowerCase() : "";

      if (msg.includes("already") || msg.includes("subscriber")) {
        return NextResponse.json({ status: "ok", already: true });
      }
    }

    // Unexpected error
    console.error("Buttondown API error:", res.status, await res.text());
    return NextResponse.json(
      { status: "error", message: "Could not subscribe. Please try again." },
      { status: 502 }
    );
  } catch (err) {
    console.error("Buttondown API request failed:", err);
    return NextResponse.json(
      { status: "error", message: "Could not reach email service." },
      { status: 502 }
    );
  }
}
