import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/security/session";
import { requirePermission } from "@/lib/security/rbac";
import { validateTenantAccess } from "@/lib/security/tenant";
import { parseVoterCsv } from "@/lib/utils/csv-parser";
import { dbService } from "@/lib/store/data-service";
import { storageService } from "@/lib/storage";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB Limit
const MAX_ROWS = 10000;

export async function POST(req: NextRequest) {
  const session = getRequestSession(req);
  const perm = requirePermission(session, "voter", "import");
  if (!perm.authorized) return perm.errorResponse!;

  const tenantCheck = validateTenantAccess(session!);
  if (!tenantCheck.authorized) return tenantCheck.errorResponse!;

  const effectiveClientId = tenantCheck.effectiveClientId!;

  try {
    const body = await req.json();
    const { csvText, boothId, areaId } = body;

    if (!csvText || typeof csvText !== "string") {
      return NextResponse.json({ error: "CSV text data is required." }, { status: 400 });
    }

    if (csvText.length > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Payload exceeds maximum allowed file size of 2MB." },
        { status: 413 }
      );
    }

    // Get existing voter cards in tenant for duplicate protection
    const existingVoters = dbService.getVoters(effectiveClientId, { pageSize: 50000 }).data;
    const existingCards = new Set(existingVoters.map((v) => v.voter_id_card.toUpperCase()));

    const parseResult = parseVoterCsv(csvText, existingCards);

    if (parseResult.totalRows > MAX_ROWS) {
      return NextResponse.json(
        { error: `CSV exceeds maximum limit of ${MAX_ROWS} records per batch import.` },
        { status: 400 }
      );
    }

    if (parseResult.validRows.length === 0) {
      return NextResponse.json(
        {
          error: "No valid voter records found in CSV payload.",
          details: parseResult.invalidRows.slice(0, 5),
        },
        { status: 400 }
      );
    }

    // Bulk insert validated records into tenant database
    const votersToInsert = parseResult.validRows.map((row) => ({
      voter_id_card: row.voter_id_card,
      name: row.name,
      mobile: row.mobile,
      age: row.age,
      gender: row.gender,
      address: row.address,
      booth_id: boothId || undefined,
      area_id: areaId || undefined,
      contact_status: (row.contact_status as any) || "uncontacted",
      follow_up_status: "none" as const,
      notes: row.notes,
    }));

    const { inserted, skipped } = dbService.batchCreateVoters(effectiveClientId, "campaign-1", votersToInsert);

    // Archive source file into voter-files bucket and create file_assets record
    let fileAssetRecord;
    try {
      const csvBlob = new Blob([csvText], { type: "text/csv" });
      const storageResult = await storageService.uploadVoterFile(csvBlob, {
        clientId: effectiveClientId,
        campaignId: "campaign-1",
        uploadedBy: session!.userId,
        customName: `voter_roll_batch_${Date.now()}.csv`,
        metadata: {
          total_rows: parseResult.totalRows,
          imported_rows: inserted,
          duplicates: parseResult.duplicates + skipped,
          invalid_rows: parseResult.invalidRows.length,
          uploaded_by_name: session!.fullName,
        },
      });
      fileAssetRecord = storageResult.fileAsset;
    } catch (archiveErr) {
      console.warn("Voter file storage archiving notice:", archiveErr);
    }

    dbService.logAction(
      { id: session!.userId, name: session!.fullName },
      "VOTERS_BULK_IMPORTED",
      "Voter",
      undefined,
      {
        count: inserted,
        totalRows: parseResult.totalRows,
        duplicates: parseResult.duplicates + skipped,
        fileAssetId: fileAssetRecord?.id,
        storagePath: fileAssetRecord?.storage_path,
      },
      effectiveClientId
    );

    return NextResponse.json({
      success: true,
      importedCount: inserted,
      totalRows: parseResult.totalRows,
      invalidCount: parseResult.invalidRows.length,
      duplicates: parseResult.duplicates + skipped,
    });
  } catch (err) {
    console.error("Voter import API error:", err);
    return NextResponse.json({ error: "Failed to process voter CSV import." }, { status: 500 });
  }
}
