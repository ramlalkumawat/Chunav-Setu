export interface CsvVoterRow {
  voter_id_card: string;
  name: string;
  mobile?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other' | 'Unknown';
  address?: string;
  contact_status?: string;
  notes?: string;
  isValid: boolean;
  errors: string[];
}

export interface CsvParseResult {
  headers: string[];
  totalRows: number;
  validRows: CsvVoterRow[];
  invalidRows: CsvVoterRow[];
  duplicates: number;
}

export function parseVoterCsv(csvText: string, existingVoterCards: Set<string> = new Set()): CsvParseResult {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    return {
      headers: [],
      totalRows: 0,
      validRows: [],
      invalidRows: [],
      duplicates: 0,
    };
  }

  const headerLine = lines[0];
  const rawHeaders = headerLine.split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
  const normalizedHeaders = rawHeaders.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));

  // Detect column mapping indices
  const idIdx = normalizedHeaders.findIndex((h) => h.includes("voter") || h.includes("epic") || h.includes("idcard") || h.includes("card"));
  const nameIdx = normalizedHeaders.findIndex((h) => h.includes("name") && !h.includes("booth") && !h.includes("area"));
  const mobileIdx = normalizedHeaders.findIndex((h) => h.includes("mobile") || h.includes("phone") || h.includes("contact"));
  const ageIdx = normalizedHeaders.findIndex((h) => h.includes("age") || h.includes("dob"));
  const genderIdx = normalizedHeaders.findIndex((h) => h.includes("gender") || h.includes("sex"));
  const addressIdx = normalizedHeaders.findIndex((h) => h.includes("address") || h.includes("locality") || h.includes("house") || h.includes("street"));
  const statusIdx = normalizedHeaders.findIndex((h) => h.includes("status"));
  const notesIdx = normalizedHeaders.findIndex((h) => h.includes("note") || h.includes("remark"));

  const validRows: CsvVoterRow[] = [];
  const invalidRows: CsvVoterRow[] = [];
  const seenCardsInFile = new Set<string>();
  let duplicates = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle CSV split with commas inside quotes
    const values: string[] = [];
    let insideQuote = false;
    let currentVal = "";

    for (let char of line) {
      if (char === '"' || char === "'") {
        insideQuote = !insideQuote;
      } else if (char === "," && !insideQuote) {
        values.push(currentVal.trim().replace(/^["']|["']$/g, ""));
        currentVal = "";
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim().replace(/^["']|["']$/g, ""));

    const errors: string[] = [];

    const voterId = idIdx !== -1 && values[idIdx] ? values[idIdx].trim().toUpperCase() : "";
    const name = nameIdx !== -1 && values[nameIdx] ? values[nameIdx].trim() : "";
    const mobile = mobileIdx !== -1 && values[mobileIdx] ? values[mobileIdx].trim() : undefined;
    const ageRaw = ageIdx !== -1 && values[ageIdx] ? parseInt(values[ageIdx].trim(), 10) : undefined;
    const genderRaw = genderIdx !== -1 && values[genderIdx] ? values[genderIdx].trim() : undefined;
    const address = addressIdx !== -1 && values[addressIdx] ? values[addressIdx].trim() : undefined;
    const contactStatus = statusIdx !== -1 && values[statusIdx] ? values[statusIdx].trim().toLowerCase() : "uncontacted";
    const notes = notesIdx !== -1 && values[notesIdx] ? values[notesIdx].trim() : undefined;

    if (!voterId) {
      errors.push("Missing Voter ID / EPIC Number");
    } else if (seenCardsInFile.has(voterId)) {
      duplicates++;
      errors.push(`Duplicate Voter ID within file (${voterId})`);
    } else if (existingVoterCards.has(voterId)) {
      duplicates++;
      errors.push(`Voter ID already exists in campaign database (${voterId})`);
    }

    if (!name) {
      errors.push("Missing Voter Full Name");
    }

    let gender: 'Male' | 'Female' | 'Other' | 'Unknown' = 'Unknown';
    if (genderRaw) {
      const g = genderRaw.toLowerCase();
      if (g.startsWith("m")) gender = "Male";
      else if (g.startsWith("f") || g.startsWith("w")) gender = "Female";
      else if (g.startsWith("o") || g.startsWith("t")) gender = "Other";
    }

    const rowObj: CsvVoterRow = {
      voter_id_card: voterId,
      name,
      mobile,
      age: isNaN(ageRaw as number) ? undefined : ageRaw,
      gender,
      address,
      contact_status: contactStatus,
      notes,
      isValid: errors.length === 0,
      errors,
    };

    if (voterId) seenCardsInFile.add(voterId);

    if (rowObj.isValid) {
      validRows.push(rowObj);
    } else {
      invalidRows.push(rowObj);
    }
  }

  return {
    headers: rawHeaders,
    totalRows: validRows.length + invalidRows.length,
    validRows,
    invalidRows,
    duplicates,
  };
}

export function exportToCsv(filename: string, headers: string[], rows: (string | number | undefined | null)[][]): void {
  const csvContent = [
    headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
    ...rows.map((row) =>
      row
        .map((val) => {
          if (val === undefined || val === null) return '""';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
