// The Cloudflare Worker in front of the static export (out/). Static files are served by
// Workers static assets without running this code; it runs only for /api/* and /studio/*
// (wrangler.jsonc, run_worker_first).
//
// /api/subscribe is ported from the Next.js route the site used on Vercel
// (src/app/api/subscribe/route.vercel.ts, deleted in c7be716), with these differences:
// the client IP comes from cf-connecting-ip; a non-POST answers 405 with JSON; a body that is
// not a JSON object with a string email answers 400 (the old route answered 500 on {"email":42});
// the Buttondown call times out after 10 s; BUTTONDOWN_URL is a local test seam, set only in
// .dev.vars and never in production.

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  EMAIL_SERVICE_API_KEY?: string;
  BUTTONDOWN_URL?: string;
}

const BUTTONDOWN_API = "https://api.buttondown.com/v1/subscribers";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// Simple in-memory rate limiting, per Worker instance (as weak as the old route's).
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

async function subscribe(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json({ status: "error", message: "Method not allowed." }, 405);
  }

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  if (isRateLimited(ip)) {
    return json({ status: "error", message: "Too many requests. Try again later." }, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ status: "error", message: "Invalid request body." }, 400);
  }

  const raw =
    body !== null && typeof body === "object" && !Array.isArray(body)
      ? (body as { email?: unknown }).email
      : undefined;
  const email = typeof raw === "string" ? raw.trim() : "";
  if (!email || !isValidEmail(email)) {
    return json({ status: "error", message: "Invalid email address." }, 400);
  }

  if (!env.EMAIL_SERVICE_API_KEY) {
    console.error("EMAIL_SERVICE_API_KEY is not configured");
    return json({ status: "error", message: "Email service is not configured." }, 500);
  }

  try {
    const res = await fetch(env.BUTTONDOWN_URL || BUTTONDOWN_API, {
      method: "POST",
      headers: {
        Authorization: `Token ${env.EMAIL_SERVICE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        type: "unactivated", // triggers double opt-in
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (res.status === 201) {
      return json({ status: "ok" });
    }

    // Buttondown returns 400 with a code for existing subscribers
    if (res.status === 400) {
      const data = await res.json();
      const detail = Array.isArray(data) ? data[0] : data.detail || "";
      const msg = typeof detail === "string" ? detail.toLowerCase() : "";

      if (msg.includes("already") || msg.includes("subscriber")) {
        return json({ status: "ok", already: true });
      }
    }

    // Unexpected error
    console.error("Buttondown API error:", res.status, await res.text());
    return json({ status: "error", message: "Could not subscribe. Please try again." }, 502);
  } catch (err) {
    console.error("Buttondown API request failed:", err);
    return json({ status: "error", message: "Could not reach email service." }, 502);
  }
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/subscribe") return subscribe(request, env);
    // The export has one Studio shell, /studio; the Studio routes its own deep links.
    if (url.pathname.startsWith("/studio/")) {
      return env.ASSETS.fetch(new Request(new URL("/studio", url), request));
    }
    return env.ASSETS.fetch(request);
  },
};

export default worker;
