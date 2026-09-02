import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/security/session";
import { validateTenantAccess } from "@/lib/security/tenant";
import { storageService } from "@/lib/storage";
import { CampaignFileCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = getRequestSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Valid session required for file upload." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "campaign-files";
    const category = (formData.get("category") as CampaignFileCategory) || "other";
    const targetClientId = (formData.get("clientId") as string) || session.clientId;
    const campaignId = (formData.get("campaignId") as string) || undefined;
    const module = (formData.get("module") as string) || (bucket === "voter-files" ? "voter_import" : "branding");
    const entityType = (formData.get("entityType") as string) || undefined;
    const entityId = (formData.get("entityId") as string) || undefined;
    const altText = (formData.get("altText") as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: "No file provided in form data." }, { status: 400 });
    }

    // Strict multi-tenant verification: never trust client_id from browser directly
    const tenantCheck = validateTenantAccess(session, targetClientId);
    if (!tenantCheck.authorized) {
      return tenantCheck.errorResponse!;
    }
    const effectiveClientId = tenantCheck.effectiveClientId!;

    let result;
    if (bucket === "voter-files") {
      result = await storageService.uploadVoterFile(file, {
        clientId: effectiveClientId,
        campaignId,
        uploadedBy: session.userId,
        customName: file.name,
      });
    } else {
      result = await storageService.uploadCampaignFile(file, {
        clientId: effectiveClientId,
        category,
        campaignId,
        uploadedBy: session.userId,
        customName: file.name,
        module,
        entityType,
        entityId,
        metadata: {
          alt_text: altText,
          uploaded_by_name: session.fullName,
          user_role: session.role,
        },
      });
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "File upload failed validation or processing." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      fileAsset: result.fileAsset,
      storagePath: result.storagePath,
      signedUrl: result.signedUrl,
    });
  } catch (err: any) {
    console.error("Storage upload API error:", err);
    return NextResponse.json(
      { error: "Internal server error during storage upload." },
      { status: 500 }
    );
  }
}
