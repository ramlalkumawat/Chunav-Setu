"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { useLanguage } from "@/lib/i18n";
import { parseVoterCsv, CsvParseResult } from "@/lib/utils/csv-parser";
import { storageService } from "@/lib/storage";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

export default function VoterImportPage() {
  const router = useRouter();
  const { client, user } = useAuth();
  const { success, error: toastError } = useToast();
  const { t } = useLanguage();
  const clientId = client?.id || user?.client_id || "";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [csvContent, setCsvContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);

  const [selectedBoothId, setSelectedBoothId] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState("");

  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    inserted: number;
    skipped: number;
    duplicates: number;
    invalid: number;
  } | null>(null);

  const booths = dbService.getBooths(clientId);
  const areas = dbService.getAreas(clientId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRawFile(file);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvContent(text);
      processCsv(text);
    };
    reader.readAsText(file);
  };

  const processCsv = (text: string) => {
    const existingVoters = dbService.getVoters(clientId, { pageSize: 10000 }).data;
    const existingCards = new Set(existingVoters.map((v) => v.voter_id_card.trim().toUpperCase()));

    const result = parseVoterCsv(text, existingCards);
    setParseResult(result);
    setStep(2);
  };

  const handleSampleLoad = () => {
    const sampleCsv = `Voter ID,Full Name,Mobile,Age,Gender,Address,Status
UP/48/281/008801,Ramesh Chandra Tiwari,+91 94150 99881,51,Male,H.No 102/B Park Street,uncontacted
UP/48/281/008802,Shalini Tiwari,+91 94150 99882,47,Female,H.No 102/B Park Street,uncontacted
UP/48/281/008803,Manish Kumar Verma,+91 98390 11990,29,Male,Flat 301 Krishna Heights,uncontacted
UP/48/281/008804,Geeta Devi Verma,,63,Female,Flat 301 Krishna Heights,uncontacted
UP/48/281/008805,Mohammad Irfan,+91 97920 44332,34,Male,Shop 12 Market Complex,uncontacted
UP/48/281/008806,Nasreen Bano,,30,Female,H.No 45 New Basti,uncontacted
UP/48/281/001421,Duplicate Existing Voter,+91 99999 99999,40,Male,Test,uncontacted`;

    setFileName("Sample_Electoral_Roll_2026.csv");
    setRawFile(new File([sampleCsv], "Sample_Electoral_Roll_2026.csv", { type: "text/csv" }));
    setCsvContent(sampleCsv);
    processCsv(sampleCsv);
  };

  const handleConfirmImport = async () => {
    if (!parseResult || parseResult.validRows.length === 0) {
      toastError("No Valid Rows", "No valid voter entries found to import.");
      return;
    }

    setIsImporting(true);

    // 1. Archive raw source file to voter-files/{clientId}/{filename} in Supabase Storage
    let fileAssetRecord;
    try {
      const fileToUpload = rawFile || new Blob([csvContent], { type: "text/csv" });
      const storageRes = await storageService.uploadVoterFile(fileToUpload, {
        clientId,
        campaignId: "camp-1",
        uploadedBy: user?.id,
        customName: fileName || "candidate_voter_batch.csv",
        metadata: {
          total_rows: parseResult.totalRows,
          valid_rows: parseResult.validRows.length,
          uploaded_by_name: user?.full_name,
        },
      });
      if (storageRes.success) {
        fileAssetRecord = storageRes.fileAsset;
      }
    } catch (archiveErr) {
      console.warn("Storage archiving warning:", archiveErr);
    }

    const booth = booths.find((b) => b.id === selectedBoothId) || booths[0];
    const area = areas.find((a) => a.id === selectedAreaId) || areas[0];

    const votersToInsert = parseResult.validRows.map((row) => ({
      voter_id_card: row.voter_id_card,
      name: row.name,
      mobile: row.mobile,
      age: row.age,
      gender: row.gender,
      address: row.address,
      booth_id: booth?.id,
      booth_name: booth?.booth_name,
      booth_number: booth?.booth_number,
      area_id: area?.id,
      area_name: area?.name,
      contact_status: (row.contact_status as any) || "uncontacted",
      follow_up_status: "none" as const,
      notes: row.notes,
    }));

    const result = dbService.batchCreateVoters(clientId, booth?.campaign_id || "camp-1", votersToInsert);

    dbService.logAction(
      { id: user?.id, name: user?.full_name || "Admin" },
      "VOTER_BATCH_IMPORTED",
      "VoterBatch",
      `batch-${Date.now()}`,
      {
        inserted: result.inserted,
        skipped: result.skipped,
        fileName,
        fileAssetId: fileAssetRecord?.id,
        storagePath: fileAssetRecord?.storage_path,
      },
      clientId
    );

    setImportSummary({
      inserted: result.inserted,
      skipped: result.skipped,
      duplicates: parseResult.duplicates,
      invalid: parseResult.invalidRows.length,
    });

    setIsImporting(false);
    setStep(3);
    success(
      "Batch Import Successful",
      `Imported ${result.inserted} electors into campaign and archived file in private storage.`
    );
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Control Panel Header */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] px-5 py-4 flex items-center justify-between shadow-none">
        <div className="flex items-center gap-3">
          <Link href="/client/voters">
            <button className="h-10 w-10 flex items-center justify-center rounded-[4px] border border-[#DEE2E6] bg-white hover:bg-[#F8F9FA] text-[#212529]">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-sm text-[#6C757D] font-medium">
              <span>{t("navVoters")}</span>
              <span>/</span>
              <span className="font-semibold text-[#212529]">{t("importVoters")}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#212529] tracking-tight">{t("importVoters")}</h1>
          </div>
        </div>

        {/* Wizard Steps indicator */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
          <span className={`px-3 py-1 rounded-[3px] font-semibold ${step === 1 ? "bg-[#714B67] text-white" : "bg-[#F8F9FA] text-[#6C757D] border border-[#DEE2E6]"}`}>
            1. Upload
          </span>
          <span className={`px-3 py-1 rounded-[3px] font-semibold ${step === 2 ? "bg-[#714B67] text-white" : "bg-[#F8F9FA] text-[#6C757D] border border-[#DEE2E6]"}`}>
            2. Validate
          </span>
          <span className={`px-3 py-1 rounded-[3px] font-semibold ${step === 3 ? "bg-[#2E7D32] text-white" : "bg-[#F8F9FA] text-[#6C757D] border border-[#DEE2E6]"}`}>
            3. Summary
          </span>
        </div>
      </div>

      {/* STEP 1: UPLOAD */}
      {step === 1 && (
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#DEE2E6] rounded-[4px] p-10 sm:p-14 bg-[#F8F9FA] text-center">
            <div className="w-14 h-14 rounded-[4px] bg-[#F1ECEF] text-[#714B67] flex items-center justify-center mb-4">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-[#212529]">
              Select CSV Electoral Roll
            </h3>
            <p className="text-sm text-[#6C757D] max-w-md mt-1.5 mb-5 leading-relaxed">
              Standard format headers: <code className="text-[#714B67] font-bold">Voter ID / EPIC</code>, <code className="text-[#714B67] font-bold">Full Name</code>, <code className="text-[#714B67] font-bold">Mobile</code>, <code className="text-[#714B67] font-bold">Age</code>, <code className="text-[#714B67] font-bold">Gender</code>, <code className="text-[#714B67] font-bold">Address</code>.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <span className="inline-flex items-center gap-2 h-11 px-5 rounded-[4px] bg-[#714B67] hover:bg-[#5E3E55] text-white font-bold text-[15px] transition-colors select-none">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Choose CSV File...</span>
                </span>
              </label>

              <Button variant="secondary" size="md" onClick={handleSampleLoad}>
                Load Sample Test Batch
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: PREVIEW & VALIDATION */}
      {step === 2 && parseResult && (
        <div className="space-y-4">
          <Card padding="md" className="bg-[#F8F9FA]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label={t("pollingBooth")}
                value={selectedBoothId}
                onChange={(e) => setSelectedBoothId(e.target.value)}
                options={booths.map((b) => ({
                  value: b.id,
                  label: `${b.booth_number} - ${b.booth_name}`,
                }))}
                required
              />
              <Select
                label={t("areaWard")}
                value={selectedAreaId}
                onChange={(e) => setSelectedAreaId(e.target.value)}
                options={areas.map((a) => ({
                  value: a.id,
                  label: `${a.name} (${a.ward_number || ""})`,
                }))}
                required
              />
            </div>
          </Card>

          {/* Validation Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="p-3.5 bg-white border border-[#DEE2E6] rounded-[4px]">
              <p className="text-xs font-semibold text-[#6C757D]">Total Rows</p>
              <p className="text-2xl font-bold text-[#212529] mt-0.5">{parseResult.totalRows}</p>
            </div>
            <div className="p-3.5 bg-[#E8F5E9] border border-[#C8E6C9] rounded-[4px]">
              <p className="text-xs font-semibold text-[#2E7D32]">Valid Electors</p>
              <p className="text-2xl font-bold text-[#2E7D32] mt-0.5">{parseResult.validRows.length}</p>
            </div>
            <div className="p-3.5 bg-[#FFF3E0] border border-[#FFE0B2] rounded-[4px]">
              <p className="text-xs font-semibold text-[#E65100]">Duplicates Found</p>
              <p className="text-2xl font-bold text-[#E65100] mt-0.5">{parseResult.duplicates}</p>
            </div>
            <div className="p-3.5 bg-[#FFEBEE] border border-[#FFCDD2] rounded-[4px]">
              <p className="text-xs font-semibold text-[#C62828]">Invalid Rows</p>
              <p className="text-2xl font-bold text-[#C62828] mt-0.5">{parseResult.invalidRows.length}</p>
            </div>
          </div>

          {/* Preview Table */}
          <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
              <h3 className="text-sm font-bold text-[#212529]">
                Preview: {fileName}
              </h3>
              <Badge variant={parseResult.invalidRows.length === 0 ? "success" : "warning"} size="md">
                {parseResult.validRows.length} Valid / {parseResult.totalRows} Total
              </Badge>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="odoo-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>EPIC Number</th>
                    <th>Full Name</th>
                    <th>Mobile</th>
                    <th>Demographics</th>
                    <th>Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {[...parseResult.validRows, ...parseResult.invalidRows].slice(0, 15).map((row, idx) => (
                    <tr key={idx} className={row.isValid ? "" : "bg-[#FFEBEE]/40"}>
                      <td>
                        {row.isValid ? (
                          <span className="text-xs font-semibold text-[#2E7D32] flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                            Valid
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-[#C62828] flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-[#C62828]" />
                            Invalid
                          </span>
                        )}
                      </td>
                      <td className="font-mono text-sm font-bold text-[#714B67]">
                        {row.voter_id_card || "MISSING"}
                      </td>
                      <td className="font-bold text-[#212529]">{row.name || "MISSING"}</td>
                      <td className="font-mono text-[14px] text-[#6C757D]">{row.mobile || "—"}</td>
                      <td className="text-[14px] text-[#495057]">{row.age || "—"} • {row.gender || "—"}</td>
                      <td className="text-xs text-[#C62828] font-medium">
                        {row.errors.join(", ") || "None"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3.5 border-t border-[#DEE2E6] bg-[#F8F9FA] flex items-center justify-between">
              <Button variant="secondary" size="md" onClick={() => setStep(1)}>
                Change File
              </Button>
              <Button
                size="md"
                variant="primary"
                onClick={handleConfirmImport}
                isLoading={isImporting}
                disabled={parseResult.validRows.length === 0}
              >
                Import {parseResult.validRows.length} Records
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: RESULT SUMMARY */}
      {step === 3 && importSummary && (
        <Card padding="lg" className="text-center py-10">
          <div className="w-14 h-14 rounded-[4px] bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-[#212529]">
            Batch Import Completed
          </h2>
          <p className="text-sm text-[#6C757D] mt-1 max-w-md mx-auto">
            Voter records have been indexed and assigned to your polling booth.
          </p>

          <div className="mt-6 max-w-sm mx-auto grid grid-cols-2 gap-3 text-left">
            <div className="p-3.5 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px]">
              <p className="text-xs text-[#6C757D] font-semibold">Imported:</p>
              <p className="text-xl font-bold text-[#2E7D32] mt-0.5">{importSummary.inserted}</p>
            </div>
            <div className="p-3.5 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[4px]">
              <p className="text-xs text-[#6C757D] font-semibold">Duplicates Skipped:</p>
              <p className="text-xl font-bold text-[#E65100] mt-0.5">{importSummary.skipped}</p>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Link href="/client/voters">
              <Button size="md" variant="primary">
                {t("votersTitle")}
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setStep(1);
                setParseResult(null);
              }}
            >
              Import Another CSV
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
