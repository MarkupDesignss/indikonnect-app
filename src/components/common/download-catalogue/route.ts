import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get("url");
    const fileName = searchParams.get("name") || "catalogue.pdf";

    if (!fileUrl) {
      return NextResponse.json(
        { error: "File URL is required" },
        { status: 400 },
      );
    }

    // Parse URL to extract host
    const parsedUrl = new URL(fileUrl);
    const host = parsedUrl.host;

    // Full browser-like headers
    const fileResponse = await fetch(fileUrl, {
      method: "GET",
      headers: {
        Host: host,
        Referer: `${parsedUrl.protocol}//${host}/`,
        Origin: `${parsedUrl.protocol}//${host}`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,application/pdf,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        Connection: "keep-alive",
      },
      cache: "no-store",
      redirect: "follow",
    });

    console.log("Proxy fetch status:", fileResponse.status);
    console.log(
      "Proxy fetch content-type:",
      fileResponse.headers.get("content-type"),
    );

    if (!fileResponse.ok) {
      const errorText = await fileResponse.text();
      console.error("Remote error body:", errorText.substring(0, 500));

      return NextResponse.json(
        {
          error: `Failed to fetch file: ${fileResponse.status}`,
          details: errorText.substring(0, 200),
        },
        { status: fileResponse.status },
      );
    }

    const arrayBuffer = await fileResponse.arrayBuffer();

    console.log("File size:", arrayBuffer.byteLength, "bytes");

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          fileName,
        )}"`,
        "Content-Length": arrayBuffer.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Proxy download error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Download failed",
      },
      { status: 500 },
    );
  }
}
