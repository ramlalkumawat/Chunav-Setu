import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/security/session";
import { storageService } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = getRequestSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Session required to generate signed URLs." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { storagePath, expiresIn = 3600 } = body;

    if (!storagePath || typeof storagePath !== "string") {
      return NextResponse.json(
        { error: "storagePath parameter is required." },
        { status: 400 }
      );
    }

    // Direct HTTP URLs don't need signed URL resolution
    if (
      storagePath.startsWith("http://") ||
      storagePath.startsWith("https://") ||
      storagePath.startsWith("blob:") ||
      storagePath.startsWith("data:")
    ) {
      return NextResponse.json({
        success: true,
        signedUrl: storagePath,
        expiresIn,
      });
    }

    // Parse path to check tenant ownership (IDOR Defense)
    // Structure: campaign-files/{client_id}/... or voter-files/{client_id}/...
    const parts = storagePath.split("/");
    const pathClientId = parts.length > 1 ? parts[1] : null;

    if (session.role !== "super_admin") {
      if (!session.clientId || pathClientId !== session.clientId) {
        return NextResponse.json(
          {
            error: "Cross-Tenant Access Denied. You cannot generate access URLs for another tenant's files.",
            code: "CROSS_TENANT_VIOLATION",
          },
          { status: 403 }
        );
      }
    }

    const result = await storageService.getSignedUrl(storagePath, expiresIn);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to generate signed URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      signedUrl: result.signedUrl,
      expiresIn: result.expiresIn,
    });
  } catch (err: any) {
    console.error("Signed URL API error:", err);
    return NextResponse.json(
      { error: "Internal server error generating signed URL." },
      { status: 500 }
    );
  }
}
