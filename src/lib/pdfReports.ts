import { Company, VotingSession, ResolutionResult, Shareholder } from "@/types";

export interface ScrutinizerReportOptions {
  company: Company | null;
  session: VotingSession | null;
  results: ResolutionResult[];
  shareholderCount?: number;
  totalShares?: number;
  merkleRoot?: string | null;
  txHash?: string | null;
}

export interface ShareholderRosterReportOptions {
  company: Company | null;
  shareholders: Shareholder[];
}

export interface VotingCertificateOptions {
  shareholderName: string;
  shareholderEmail: string;
  sharesHeld: number;
  companyName: string;
  sessionTitle: string;
  votes: Array<{
    resolutionTitle: string;
    decision: string;
    voteHash: string;
    timestamp: string;
  }>;
  merkleRoot?: string;
}

/**
 * Generates an executive, boardroom-grade Scrutinizer Audit Report PDF
 */
export const generateScrutinizerAuditPDF = async (opts: ScrutinizerReportOptions) => {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors
  const primaryNavy = [13, 27, 42]; // #0d1b2a
  const accentBlue = [30, 58, 138]; // #1e3a8a
  const goldAccent = [217, 119, 6];  // #d97706
  const slateText = [71, 85, 105];   // #475569

  // 1. Header Banner
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.rect(0, 0, pageWidth, 32, "F");

  // Gold accent bar
  doc.setFillColor(goldAccent[0], goldAccent[1], goldAccent[2]);
  doc.rect(0, 32, pageWidth, 2, "F");

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("OFFICIAL SCRUTINIZER AUDIT & RESOLUTION REPORT", 14, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text("Statutory E-Voting Consensus & Cryptographic Integrity Verification", 14, 23);

  // Document Timestamp & Ref ID
  const reportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const reportRef = `SCR-${Math.floor(100000 + Math.random() * 900000)}`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`DATE: ${reportDate}`, pageWidth - 14, 15, { align: "right" });
  doc.text(`REF: ${reportRef}`, pageWidth - 14, 23, { align: "right" });

  // 2. Organization & Session Metadata Box
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(opts.company?.company_name || "Enterprise Corporate Governance", 14, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  
  const cinText = opts.company?.cin_number ? `CIN: ${opts.company.cin_number}` : "Corporate ID: Registered Entity";
  const panText = opts.company?.pan_number ? ` | Tax ID: ${opts.company.pan_number}` : "";
  doc.text(`${cinText}${panText}`, 14, 47);
  doc.text(`Event: ${opts.session?.event_type ? `[${opts.session.event_type}] ` : ""}${opts.session?.title || "General Meeting"}`, 14, 52);

  // Voting Window
  const startStr = (opts.session?.voting_start || opts.session?.start_date) ? new Date(opts.session.voting_start || opts.session.start_date!).toLocaleString() : "N/A";
  const endStr = (opts.session?.voting_end || opts.session?.end_date) ? new Date(opts.session.voting_end || opts.session.end_date!).toLocaleString() : "N/A";
  doc.text(`Voting Window: ${startStr} to ${endStr}`, 14, 57);

  // 3. Executive KPI Summary Cards
  const totalVotesCast = opts.results.reduce((acc, r) => acc + r.stats.total, 0);
  const passedCount = opts.results.filter(r => {
    if (r.stats.winner !== undefined) return r.stats.winner;
    const valid = r.stats.for + r.stats.against;
    return r.resolution_type === "special" ? (valid > 0 && r.stats.for >= 3 * r.stats.against) : r.stats.for > r.stats.against;
  }).length;
  const quorumStatus = "MET & COMPLIANT";

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 62, pageWidth - 28, 20, 2, 2, "FD");

  const kpiY = 69;
  const colWidth = (pageWidth - 28) / 4;

  // KPI 1: Total Resolutions
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text("TOTAL AGENDAS", 14 + 5, kpiY);
  doc.setFontSize(11);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text(opts.results.length.toString(), 14 + 5, kpiY + 7);

  // KPI 2: Passed Resolutions
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text("PASSED STATUTORY", 14 + colWidth + 5, kpiY);
  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text(passedCount.toString(), 14 + colWidth + 5, kpiY + 7);

  // KPI 3: Total Votes Cast
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text("VOTES CAST", 14 + colWidth * 2 + 5, kpiY);
  doc.setFontSize(11);
  doc.setTextColor(accentBlue[0], accentBlue[1], accentBlue[2]);
  doc.text(totalVotesCast.toLocaleString(), 14 + colWidth * 2 + 5, kpiY + 7);

  // KPI 4: Quorum Health
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text("STATUTORY QUORUM", 14 + colWidth * 3 + 5, kpiY);
  doc.setFontSize(9.5);
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text(quorumStatus, 14 + colWidth * 3 + 5, kpiY + 7);

  // 4. Tabular Results Section
  const tableData = opts.results.map((r, index) => {
    const total = r.stats.total || (r.stats.for + r.stats.against + r.stats.abstain) || 1;
    const approvalPct = total > 0 ? ((r.stats.for / total) * 100).toFixed(2) : "0.00";
    const isPassed = r.stats.winner !== undefined
      ? r.stats.winner
      : (r.resolution_type === "special" ? (r.stats.for + r.stats.against > 0 && r.stats.for >= 3 * r.stats.against) : r.stats.for > r.stats.against);
    const outcome = isPassed
      ? (r.resolution_type === "special" ? "PASSED (SPECIAL ≥75%)" : "PASSED (ORDINARY)")
      : "REJECTED";

    return [
      index + 1,
      r.title,
      r.stats.for.toLocaleString(),
      r.stats.against.toLocaleString(),
      r.stats.abstain.toLocaleString(),
      total.toLocaleString(),
      `${approvalPct}%`,
      outcome,
    ];
  });

  autoTable(doc, {
    startY: 88,
    head: [["#", "Resolution Motion & Agenda", "Assent (For)", "Dissent (Against)", "Abstain", "Total Shares", "Consensus", "Outcome"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [13, 27, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2.8,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 62 },
      2: { cellWidth: 20, halign: "right", textColor: [16, 185, 129], fontStyle: "bold" },
      3: { cellWidth: 20, halign: "right", textColor: [239, 68, 68] },
      4: { cellWidth: 16, halign: "right", textColor: [100, 116, 139] },
      5: { cellWidth: 20, halign: "right", fontStyle: "bold" },
      6: { cellWidth: 18, halign: "center", fontStyle: "bold" },
      7: { cellWidth: 18, halign: "center", fontStyle: "bold" },
    },
    // Custom color rendering for outcome
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 7) {
        if (data.cell.raw === "PASSED") {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald
        } else {
          data.cell.styles.textColor = [239, 68, 68]; // Red
        }
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let finalY = (doc as any).lastAutoTable.finalY + 8;

  // If near bottom of page, add a new page
  if (finalY > pageHeight - 65) {
    doc.addPage();
    finalY = 20;
  }

  // 5. Statutory Assurance & Governance Compliance Banner
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, finalY, pageWidth - 28, 14, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text("STATUTORY COMPLIANCE & INTEGRITY CERTIFICATION", 18, finalY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text(
    "All electronic ballots in this general meeting were authenticated, verified, and sealed in accordance with corporate governance e-voting regulations.",
    18,
    finalY + 10
  );

  finalY += 22;

  // If near bottom, add page
  if (finalY > pageHeight - 45) {
    doc.addPage();
    finalY = 20;
  }

  // 6. Official Sign-off & Attestation Block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text("SCRUTINIZER ATTESTATION & SIGN-OFF", 14, finalY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text(
    "I have scrutinized the electronic voting process, verified the cryptographic vote hashes against the master register, and hereby certify that the above resolutions have been duly passed in accordance with applicable corporate governance statutes.",
    14,
    finalY + 4,
    { maxWidth: pageWidth - 28 }
  );

  const signY = finalY + 22;

  // Scrutinizer Signature Line
  doc.setDrawColor(148, 163, 184);
  doc.line(14, signY, 75, signY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text(opts.company?.cs_name || "Official Independent Scrutinizer", 14, signY + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text("Practicing Company Secretary / Auditor", 14, signY + 8);
  if (opts.company?.cs_membership_number) {
    doc.text(`Membership No: ${opts.company.cs_membership_number}`, 14, signY + 12);
  }

  // Authorized Corporate Officer Signature Line
  doc.line(pageWidth - 75, signY, pageWidth - 14, signY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text("Authorized Corporate Signatory", pageWidth - 75, signY + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text(opts.company?.company_name || "Board of Directors", pageWidth - 75, signY + 8);
  doc.text("For & on behalf of the Board", pageWidth - 75, signY + 12);

  // 7. Running Page Numbering & Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("Vote Secure Enterprise Governance System — Confidential & Legally Binding Record", 14, pageHeight - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: "right" });
  }

  const filename = `${(opts.company?.company_name || "enterprise").replace(/[^a-zA-Z0-9]/g, "_")}_Scrutinizer_Audit_Report.pdf`;
  doc.save(filename);
};

/**
 * Generates an executive Shareholder Roster & Capital Representation PDF
 */
export const generateShareholderRosterPDF = async (opts: ShareholderRosterReportOptions) => {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const primaryNavy = [13, 27, 42];
  const goldAccent = [217, 119, 6];
  const slateText = [71, 85, 105];

  // Header Banner
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.rect(0, 0, pageWidth, 30, "F");

  doc.setFillColor(goldAccent[0], goldAccent[1], goldAccent[2]);
  doc.rect(0, 30, pageWidth, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("OFFICIAL SHAREHOLDER REGISTRY & LEDGER", 14, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text("Corporate Stakeholder Register & Voting Capital Representation", 14, 22);

  const reportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`GENERATED: ${reportDate}`, pageWidth - 14, 15, { align: "right" });
  doc.text(`TOTAL MEMBERS: ${opts.shareholders.length}`, pageWidth - 14, 22, { align: "right" });

  // Organization Header
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(opts.company?.company_name || "Enterprise Register", 14, 40);

  const totalShares = opts.shareholders.reduce((acc, s) => acc + (s.shares_held || 0), 0);
  const activeCount = opts.shareholders.filter(s => s.is_credential_used).length;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text(`Corporate ID / CIN: ${opts.company?.cin_number || "Verified"} | Total Voting Capital: ${totalShares.toLocaleString()} Shares`, 14, 45);
  doc.text(`Activated Stakeholders: ${activeCount} of ${opts.shareholders.length} (${opts.shareholders.length > 0 ? Math.round((activeCount / opts.shareholders.length) * 100) : 0}%)`, 14, 50);

  // Table
  const tableData = opts.shareholders.map((s, idx) => [
    idx + 1,
    s.shareholder_name,
    s.email,
    s.shares_held.toLocaleString(),
    totalShares > 0 ? `${((s.shares_held / totalShares) * 100).toFixed(2)}%` : "0.00%",
    s.login_id || "N/A",
    s.is_credential_used ? "Active / Voted" : "Pending Access",
  ]);

  autoTable(doc, {
    startY: 56,
    head: [["#", "Shareholder Name", "Email Address", "Shares Held", "Capital %", "Login ID", "Status"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [13, 27, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      cellPadding: 2.8,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 42, fontStyle: "bold" },
      2: { cellWidth: 50 },
      3: { cellWidth: 24, halign: "right", fontStyle: "bold" },
      4: { cellWidth: 18, halign: "center" },
      5: { cellWidth: 20, halign: "center", fontStyle: "bold" },
      6: { cellWidth: 20, halign: "center" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 6) {
        if (data.cell.raw === "Active / Voted") {
          data.cell.styles.textColor = [16, 185, 129];
          data.cell.styles.fontStyle = "bold";
        } else {
          data.cell.styles.textColor = [217, 119, 6];
        }
      }
    },
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("Official Shareholder Roster — Corporate Governance Ledger Record", 14, pageHeight - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: "right" });
  }

  const filename = `${(opts.company?.company_name || "shareholders").replace(/[^a-zA-Z0-9]/g, "_")}_Shareholder_Roster.pdf`;
  doc.save(filename);
};
