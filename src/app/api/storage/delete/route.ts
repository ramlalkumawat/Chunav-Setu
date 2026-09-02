import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/security/session";
import { validateTenantAccess } from "@/lib/security/tenant";
import { storageService } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = getRequestSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Session required to delete files." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { assetId, clientId } = body;

    if (!assetId) {
      return NextResponse.json({ error: "assetId parameter is required." }, { status: 400 });
    }

    const targetClientId = clientId || session.clientId;
    const tenantCheck = validateTenantAccess(session, targetClientId);
    if (!tenantCheck.authorized) {
      return tenantCheck.errorResponse!;
    }
    const effectiveClientId = tenantCheck.effectiveClientId!;

    const res = await storageService.deleteFile(effectiveClientId, assetId);
    if (!res.success) {
      return NextResponse.json(
        { error: res.error || "Failed to delete file asset." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "File asset deleted successfully." });
  } catch (err: any) {
    console.error("Storage delete API error:", err);
    return NextResponse.json(
      { error: "Internal server error during file deletion." },
      { status: 500 }
    );
  }
}
