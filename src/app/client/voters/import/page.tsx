"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { parseVoterCsv, CsvParseResult } from "@/lib/utils/csv-parser";
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
  Download,
} from "lucide-react";

export default function VoterImportPage() {
  const router = useRouter();
  const { client, user } = useAuth();
  const { success, error: toastError } = useToast();
  const clientId = client?.id || "client-1";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [csvContent, setCsvContent] = useState("");
  const [fileName, setFileName] = useState("");
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
    setCsvContent(sampleCsv);
    processCsv(sampleCsv);
  };

  const handleConfirmImport = async () => {
    if (!parseResult || parseResult.validRows.length === 0) {
      toastError("No Valid Rows", "No valid voter entries found to import.");
      return;
    }

    setIsImporting(true);

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
      { inserted: result.inserted, skipped: result.skipped, fileName },
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
    success("Batch Import Successful", `Imported ${result.inserted} electors into campaign.`);
  };

  return (
    <div className="space-y-3 max-w-4xl mx-auto">
      {/* Odoo Control Panel Header */}
      <div className="bg-white border border-[#DEE2E6] rounded-[4px] px-3.5 py-2.5 flex items-center justify-between shadow-none">
        <div className="flex items-center gap-2.5">
          <Link href="/client/voters">
            <button className="h-8 w-8 flex items-center justify-center rounded-[3px] border border-[#DEE2E6] bg-white hover:bg-[#F8F9FA] text-[#212529]">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#6C757D]">
              <span>Voters</span>
              <span>/</span>
              <span className="font-semibold text-[#212529]">Import Wizard</span>
            </div>
            <h1 className="text-base font-bold text-[#212529]">Batch Voter CSV Import</h1>
          </div>
        </div>

        {/* Wizard Steps indicator */}
        <div className="flex items-center gap-1 text-xs">
          <span className={`px-2 py-0.5 rounded-[2px] font-medium ${step === 1 ? "bg-[#714B67] text-white" : "bg-[#F8F9FA] text-[#6C757D] border border-[#DEE2E6]"}`}>
            1. Upload
          </span>
          <span className={`px-2 py-0.5 rounded-[2px] font-medium ${step === 2 ? "bg-[#714B67] text-white" : "bg-[#F8F9FA] text-[#6C757D] border border-[#DEE2E6]"}`}>
            2. Validate
          </span>
          <span className={`px-2 py-0.5 rounded-[2px] font-medium ${step === 3 ? "bg-[#2E7D32] text-white" : "bg-[#F8F9FA] text-[#6C757D] border border-[#DEE2E6]"}`}>
            3. Summary
          </span>
        </div>
      </div>

      {/* STEP 1: UPLOAD */}
      {step === 1 && (
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center border border-dashed border-[#DEE2E6] rounded-[4px] p-8 sm:p-10 bg-[#F8F9FA] text-center">
            <div className="w-10 h-10 rounded-[4px] bg-[#F1ECEF] text-[#714B67] flex items-center justify-center mb-3">
              <UploadCloud className="w-5 h-5" />
            </div>

            <h3 className="text-sm font-bold text-[#212529]">
              Select CSV Electoral Roll
            </h3>
            <p className="text-xs text-[#6C757D] max-w-md mt-1 mb-4 leading-relaxed">
              Standard format headers: <code className="text-[#714B67] font-semibold">Voter ID / EPIC</code>, <code className="text-[#714B67] font-semibold">Full Name</code>, <code className="text-[#714B67] font-semibold">Mobile</code>, <code className="text-[#714B67] font-semibold">Age</code>, <code className="text-[#714B67] font-semibold">Gender</code>, <code className="text-[#714B67] font-semibold">Address</code>.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <span className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[4px] bg-[#714B67] hover:bg-[#5E3E55] text-white font-medium text-xs transition-colors select-none">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Choose File...</span>
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
        <div className="space-y-3">
          {/* Target Booth & Area Selection */}
          <Card padding="sm" className="bg-[#F8F9FA]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Assign to Polling Booth"
                value={selectedBoothId}
                onChange={(e) => setSelectedBoothId(e.target.value)}
                options={booths.map((b) => ({
                  value: b.id,
                  label: `${b.booth_number} - ${b.booth_name}`,
                }))}
                required
              />
              <Select
                label="Assign to Area / Ward"
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-white border border-[#DEE2E6] rounded-[4px]">
              <p className="text-[11px] text-[#6C757D]">Total Rows</p>
              <p className="text-lg font-bold text-[#212529] mt-0.5">{parseResult.totalRows}</p>
            </div>
            <div className="p-2.5 bg-[#E8F5E9] border border-[#C8E6C9] rounded-[4px]">
              <p className="text-[11px] text-[#2E7D32]">Valid Electors</p>
              <p className="text-lg font-bold text-[#2E7D32] mt-0.5">{parseResult.validRows.length}</p>
            </div>
            <div className="p-2.5 bg-[#FFF3E0] border border-[#FFE0B2] rounded-[4px]">
              <p className="text-[11px] text-[#E65100]">Duplicates Found</p>
              <p className="text-lg font-bold text-[#E65100] mt-0.5">{parseResult.duplicates}</p>
            </div>
            <div className="p-2.5 bg-[#FFEBEE] border border-[#FFCDD2] rounded-[4px]">
              <p className="text-[11px] text-[#C62828]">Invalid Rows</p>
              <p className="text-lg font-bold text-[#C62828] mt-0.5">{parseResult.invalidRows.length}</p>
            </div>
          </div>

          {/* Preview Table */}
          <div className="bg-white border border-[#DEE2E6] rounded-[4px] overflow-hidden">
            <div className="px-3.5 py-2 border-b border-[#DEE2E6] flex items-center justify-between bg-[#F8F9FA]">
              <h3 className="text-xs font-semibold text-[#212529]">
                Preview: {fileName}
              </h3>
              <Badge variant={parseResult.invalidRows.length === 0 ? "success" : "warning"} size="sm">
                {parseResult.validRows.length} Valid / {parseResult.totalRows} Total
              </Badge>
            </div>

            <div className="overflow-x-auto max-h-80">
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
                    <tr key={idx} className={row.isValid ? "" : "bg-[#FFEBEE]/30"}>
                      <td>
                        {row.isValid ? (
                          <span className="text-[11px] font-medium text-[#2E7D32] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                            Valid
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-[#C62828] flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-[#C62828]" />
                            Invalid
                          </span>
                        )}
                      </td>
                      <td className="font-mono text-xs font-semibold text-[#714B67]">
                        {row.voter_id_card || "MISSING"}
                      </td>
                      <td className="font-medium text-[#212529]">{row.name || "MISSING"}</td>
                      <td className="font-mono text-xs text-[#6C757D]">{row.mobile || "—"}</td>
                      <td className="text-xs text-[#495057]">{row.age || "—"} • {row.gender || "—"}</td>
                      <td className="text-xs text-[#C62828]">
                        {row.errors.join(", ") || "None"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-3.5 py-2.5 border-t border-[#DEE2E6] bg-[#F8F9FA] flex items-center justify-between">
              <Button variant="secondary" size="sm" onClick={() => setStep(1)}>
                Change File
              </Button>
              <Button
                size="sm"
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
        <Card padding="lg" className="text-center py-8">
          <div className="w-10 h-10 rounded-[4px] bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h2 className="text-base font-bold text-[#212529]">
            Batch Import Completed
          </h2>
          <p className="text-xs text-[#6C757D] mt-0.5 max-w-md mx-auto">
            Voter records have been indexed and assigned to your polling booth.
          </p>

          <div className="mt-4 max-w-sm mx-auto grid grid-cols-2 gap-2 text-left text-xs">
            <div className="p-2.5 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[3px]">
              <p className="text-[11px] text-[#6C757D]">Imported:</p>
              <p className="text-base font-bold text-[#2E7D32] mt-0.5">{importSummary.inserted}</p>
            </div>
            <div className="p-2.5 bg-[#F8F9FA] border border-[#DEE2E6] rounded-[3px]">
              <p className="text-[11px] text-[#6C757D]">Duplicates Skipped:</p>
              <p className="text-base font-bold text-[#E65100] mt-0.5">{importSummary.skipped}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            <Link href="/client/voters">
              <Button size="sm" variant="primary">
                Open Voter Directory
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
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
