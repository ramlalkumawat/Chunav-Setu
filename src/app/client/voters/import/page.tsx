"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dbService } from "@/lib/store/data-service";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/lib/context/toast-context";
import { parseVoterCsv, CsvParseResult, CsvVoterRow } from "@/lib/utils/csv-parser";
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
  ArrowRight,
  RefreshCw,
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

    setFileName("Sample_Voters_Batch_2026.csv");
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
    success("Batch Import Successful", `Imported ${result.inserted} electors.`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/client/voters">
            <button className="p-2 rounded-lg border border-[#E5E2DC] bg-white hover:bg-[#F7F6F2] text-[#172033]">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#172033]">CSV Voter Import Tool</h1>
            <p className="text-xs text-[#64748B]">
              Upload electoral roll spreadsheets with automated duplicate protection
            </p>
          </div>
        </div>
      </div>

      {/* 3 Step Wizard Progress Bar */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
        <div
          className={`p-2.5 rounded-lg border ${
            step === 1
              ? "bg-[#1F3A5F] text-white border-[#1F3A5F]"
              : "bg-white text-[#64748B] border-[#E5E2DC]"
          }`}
        >
          1. Upload CSV
        </div>
        <div
          className={`p-2.5 rounded-lg border ${
            step === 2
              ? "bg-[#1F3A5F] text-white border-[#1F3A5F]"
              : "bg-white text-[#64748B] border-[#E5E2DC]"
          }`}
        >
          2. Validate & Preview
        </div>
        <div
          className={`p-2.5 rounded-lg border ${
            step === 3
              ? "bg-[#2F6B4F] text-white border-[#2F6B4F]"
              : "bg-white text-[#64748B] border-[#E5E2DC]"
          }`}
        >
          3. Complete
        </div>
      </div>

      {/* STEP 1: UPLOAD */}
      {step === 1 && (
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#E5E2DC] rounded-xl p-8 sm:p-12 bg-[#FAFAF8] text-center">
            <div className="w-14 h-14 rounded-full bg-[#EAEFF5] text-[#1F3A5F] flex items-center justify-center mb-4">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-[#172033]">
              Upload Electoral Roll CSV File
            </h3>
            <p className="text-xs text-[#64748B] max-w-md mt-1 mb-6 leading-relaxed">
              Accepts CSV files with headers: <code className="text-[#1F3A5F]">Voter ID / EPIC</code>, <code className="text-[#1F3A5F]">Full Name</code>, <code className="text-[#1F3A5F]">Mobile</code>, <code className="text-[#1F3A5F]">Age</code>, <code className="text-[#1F3A5F]">Gender</code>, <code className="text-[#1F3A5F]">Address</code>.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-[#1F3A5F] hover:bg-[#172E4C] text-white font-medium text-xs shadow-sm transition-all">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Choose CSV File</span>
                </span>
              </label>

              <Button variant="outline" size="md" onClick={handleSampleLoad}>
                Load Sample Test Batch
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: PREVIEW & VALIDATION */}
      {step === 2 && parseResult && (
        <div className="space-y-4">
          {/* Target Booth & Area Selection */}
          <Card padding="md" className="bg-[#FAFAF8]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Assign Imported Voters to Polling Booth"
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white border border-[#E5E2DC] rounded-lg">
              <p className="text-[11px] text-[#64748B]">TOTAL ROWS PARSED</p>
              <p className="text-xl font-bold text-[#172033] mt-1">{parseResult.totalRows}</p>
            </div>
            <div className="p-3 bg-white border border-[#C3DEC9] bg-[#EAF3EE]/40 rounded-lg">
              <p className="text-[11px] text-[#2F6B4F]">READY TO INSERT</p>
              <p className="text-xl font-bold text-[#2F6B4F] mt-1">{parseResult.validRows.length}</p>
            </div>
            <div className="p-3 bg-white border border-[#FBE3B8] bg-[#FEF7EC]/40 rounded-lg">
              <p className="text-[11px] text-[#B7791F]">DUPLICATES DETECTED</p>
              <p className="text-xl font-bold text-[#B7791F] mt-1">{parseResult.duplicates}</p>
            </div>
            <div className="p-3 bg-white border border-[#F7C6C6] bg-[#FDF2F2]/40 rounded-lg">
              <p className="text-[11px] text-[#B94A48]">INVALID ROWS</p>
              <p className="text-xl font-bold text-[#B94A48] mt-1">{parseResult.invalidRows.length}</p>
            </div>
          </div>

          {/* Preview Table */}
          <Card padding="none">
            <div className="p-4 border-b border-[#E5E2DC] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#172033]">
                Preview First 10 Records ({fileName})
              </h3>
              <Badge variant={parseResult.invalidRows.length === 0 ? "success" : "warning"}>
                {parseResult.validRows.length} Valid / {parseResult.totalRows} Total
              </Badge>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAF8] text-[#64748B] font-semibold border-b border-[#E5E2DC] uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Voter ID / EPIC</th>
                    <th className="px-4 py-2.5">Full Name</th>
                    <th className="px-4 py-2.5">Mobile</th>
                    <th className="px-4 py-2.5">Age/Sex</th>
                    <th className="px-4 py-2.5">Address</th>
                    <th className="px-4 py-2.5">Validation Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E2DC] text-[#172033]">
                  {[...parseResult.validRows, ...parseResult.invalidRows].slice(0, 15).map((row, idx) => (
                    <tr
                      key={idx}
                      className={row.isValid ? "hover:bg-[#F7F6F2]/50" : "bg-[#FDF2F2]/40"}
                    >
                      <td className="px-4 py-2.5">
                        {row.isValid ? (
                          <span className="inline-flex items-center text-[10px] font-bold text-[#2F6B4F]">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#2F6B4F]" />
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-bold text-[#B94A48]">
                            <AlertCircle className="w-3.5 h-3.5 mr-1 text-[#B94A48]" />
                            Error
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold text-[#1F3A5F]">
                        {row.voter_id_card || "MISSING"}
                      </td>
                      <td className="px-4 py-2.5 font-medium">{row.name || "MISSING"}</td>
                      <td className="px-4 py-2.5 font-mono text-[#64748B]">{row.mobile || "—"}</td>
                      <td className="px-4 py-2.5">{row.age || "—"} • {row.gender || "—"}</td>
                      <td className="px-4 py-2.5 text-[#64748B] truncate max-w-xs">{row.address || "—"}</td>
                      <td className="px-4 py-2.5 text-[#B94A48]">
                        {row.errors.join(", ") || "None"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-[#E5E2DC] bg-[#FAFAF8] flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                Choose Another File
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmImport}
                isLoading={isImporting}
                disabled={parseResult.validRows.length === 0}
              >
                Confirm & Import {parseResult.validRows.length} Voters
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* STEP 3: RESULT SUMMARY */}
      {step === 3 && importSummary && (
        <Card padding="lg" className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-[#EAF3EE] text-[#2F6B4F] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-[#172033]">
            Import Batch Complete!
          </h2>
          <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
            The voter records have been indexed and assigned to your polling booths with tenant isolation.
          </p>

          <div className="mt-8 max-w-md mx-auto grid grid-cols-2 gap-3 text-left">
            <div className="p-3 bg-[#FAFAF8] border border-[#E5E2DC] rounded-lg">
              <p className="text-[11px] text-[#64748B]">Successfully Imported:</p>
              <p className="text-lg font-bold text-[#2F6B4F] mt-0.5">{importSummary.inserted}</p>
            </div>
            <div className="p-3 bg-[#FAFAF8] border border-[#E5E2DC] rounded-lg">
              <p className="text-[11px] text-[#64748B]">Duplicates / Skipped:</p>
              <p className="text-lg font-bold text-[#B7791F] mt-0.5">{importSummary.skipped}</p>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Link href="/client/voters">
              <Button size="md">
                View Voter Directory
              </Button>
            </Link>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setStep(1);
                setParseResult(null);
              }}
            >
              Import Another Batch
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
