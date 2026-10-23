import { NextRequest, NextResponse } from "next/server";

// Location in project: src/app/api/distributor-card/profile-photo/route.ts
// Set DISTRIBUTOR_IMAGE_HOSTS to any additional trusted image hostnames, comma-separated.
const TRUSTED_HOSTS = new Set([
  "www.markupdesigns.net",
  "markupdesigns.net",
  ...(process.env.DISTRIBUTOR_IMAGE_HOSTS ?? "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean),
]);

export async function GET(request: NextRequest) {
  const original = request.nextUrl.searchParams.get("url");
  if (!original)
    return NextResponse.json({ error: "Missing image URL" }, { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(original);
  } catch {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  // Avoid an open proxy / SSRF. Do not follow redirects to untrusted hosts.
  if (
    parsed.protocol !== "https:" ||
    !TRUSTED_HOSTS.has(parsed.hostname.toLowerCase()) ||
    parsed.port ||
    parsed.username ||
    parsed.password
  ) {
    return NextResponse.json(
      { error: "Image host not permitted" },
      { status: 403 },
    );
  }

  try {
    const upstream = await fetch(parsed.toString(), {
      redirect: "manual",
      cache: "no-store",
      headers: { Accept: "image/png,image/jpeg,image/webp,image/*;q=0.8" },
      signal: AbortSignal.timeout(10000),
    });
    if (upstream.status >= 300 && upstream.status < 400) {
      return NextResponse.json(
        {
          error:
            "Image URL redirects. Use the final HTTPS image URL or configure the storage host explicitly.",
        },
        { status: 502 },
      );
    }
    if (!upstream.ok)
      return NextResponse.json(
        {
          error: `Image storage returned HTTP ${upstream.status}. Check public access or server-side authentication.`,
        },
        { status: 502 },
      );
    const mime = (upstream.headers.get("content-type") || "")
      .split(";")[0]
      .toLowerCase();
    if (!["image/png", "image/jpeg", "image/webp"].includes(mime)) {
      return NextResponse.json(
        { error: "Expected a PNG, JPEG or WebP image" },
        { status: 415 },
      );
    }
    const length = Number(upstream.headers.get("content-length") || 0);
    if (length > 5_000_000)
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    const bytes = await upstream.arrayBuffer();
    if (bytes.byteLength > 5_000_000)
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "content-type": mime,
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Image could not be retrieved" },
      { status: 502 },
    );
  }
}
