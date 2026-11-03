/**
 * Generates a Form No. MGT-13 compliant Consolidated Scrutinizer Report PDF
 * Based on the official MCA template for e-voting results.
 */
export const generateScrutinizerAuditPDF = async (opts) => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ---- Colors ----
    const black = [0, 0, 0];
    const darkGray = [51, 51, 51];
    const medGray = [100, 100, 100];
    const headerBg = [13, 27, 42];
    const goldBar = [217, 119, 6];
    const lightBg = [248, 250, 252];
    const borderGray = [180, 180, 180];

    // ---- Helper: format date ----
    const fmtDate = (d) => {
        if (!d) return "N/A";
        const dt = new Date(d);
        return dt.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "2-digit" });
    };
    const fmtDateTime = (d) => {
        if (!d) return "N/A";
        const dt = new Date(d);
        return dt.toLocaleString("en-IN", { year: "numeric", month: "long", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true });
    };

    // ---- Gather data ----
    const companyName = opts.company?.company_name || "Company Name";
    const cinNumber = opts.company?.cin_number || "";
    const panNumber = opts.company?.pan_number || "";
    const sessionTitle = opts.session?.title || "General Meeting";
    const eventType = opts.session?.event_type || "EGM";
    const votingStart = opts.session?.voting_start || opts.session?.start_date;
    const votingEnd = opts.session?.voting_end || opts.session?.end_date;
    const recordDate = opts.session?.record_date;
    const reportDate = fmtDate(new Date());
    const shareholderCount = opts.shareholderCount || 0;
    const totalShares = opts.totalShares || 0;
    const csName = opts.company?.cs_name || "Scrutinizer Name";
    const csMembership = opts.company?.cs_membership_number || "";

    const margin = 18;
    const contentWidth = pageWidth - margin * 2;

    // ---- Helper: draw horizontal line ----
    const drawLine = (y) => {
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageWidth - margin, y);
    };

    // ---- Helper: add footer on every page ----
    const addFooters = () => {
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            drawLine(pageHeight - 18);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            doc.setTextColor(medGray[0], medGray[1], medGray[2]);
            doc.text("Vote India Secure — E-Voting Platform | shareholdervoting.in", margin, pageHeight - 13);
            doc.text("Confidential — For regulatory and audit purposes only", margin, pageHeight - 9);
            doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 13, { align: "right" });
        }
    };

    // ---- Helper: check page space and add new page if needed ----
    const ensureSpace = (y, needed) => {
        if (y + needed > pageHeight - 25) {
            doc.addPage();
            return 20;
        }
        return y;
    };

    // ================================================================
    // PAGE 1: HEADER + FORM TITLE + COVER LETTER
    // ================================================================

    // Header banner
    doc.setFillColor(headerBg[0], headerBg[1], headerBg[2]);
    doc.rect(0, 0, pageWidth, 28, "F");
    doc.setFillColor(goldBar[0], goldBar[1], goldBar[2]);
    doc.rect(0, 28, pageWidth, 1.5, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("VOTE INDIA SECURE", margin, 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text("MCA & SEBI Compliant E-Voting Platform", margin, 18);
    doc.text(`Report Date: ${reportDate}`, pageWidth - margin, 12, { align: "right" });
    const refId = `MGT13-${Date.now().toString(36).toUpperCase()}`;
    doc.text(`Ref: ${refId}`, pageWidth - margin, 18, { align: "right" });

    let y = 38;

    // Form title
    doc.setTextColor(black[0], black[1], black[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Form No. MGT - 13", pageWidth / 2, y, { align: "center" });
    y += 7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Consolidated Report of Scrutinizer", pageWidth / 2, y, { align: "center" });
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("on remote e-voting and e-voting during", pageWidth / 2, y, { align: "center" });
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${sessionTitle}`, pageWidth / 2, y, { align: "center" });
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("of", pageWidth / 2, y, { align: "center" });
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(companyName, pageWidth / 2, y, { align: "center" });
    y += 6;

    // Pursuant clause
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(medGray[0], medGray[1], medGray[2]);
    const pursuantText = "[Pursuant to Section 108 of the Companies Act, 2013 and Rule 20 of the Companies (Management and Administration) Rules, 2014 and amendments thereof]";
    const pursuantLines = doc.splitTextToSize(pursuantText, contentWidth);
    doc.text(pursuantLines, pageWidth / 2, y, { align: "center" });
    y += pursuantLines.length * 4 + 4;

    drawLine(y);
    y += 6;

    // Date line
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`Date: ${reportDate}`, margin, y);
    y += 8;

    // To, The Chairperson
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("To,", margin, y); y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("The Chairperson", margin, y); y += 5;
    doc.setFont("helvetica", "normal");
    doc.text(companyName, margin, y); y += 5;
    if (cinNumber) { doc.text(`CIN: ${cinNumber}`, margin, y); y += 5; }
    if (panNumber) { doc.text(`PAN: ${panNumber}`, margin, y); y += 5; }
    y += 3;

    doc.setFont("helvetica", "bold");
    doc.text("Dear Sir/Madam,", margin, y);
    y += 7;

    // Main body paragraph
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    const reText = `Re: ${sessionTitle} of the Equity Shareholders of ${companyName} held on ${fmtDate(votingEnd)} through Video Conferencing / Other Audio Visual Means ("VC / OAVM").`;
    const reLines = doc.splitTextToSize(reText, contentWidth);
    doc.text(reLines, margin, y);
    y += reLines.length * 4 + 5;

    const appointmentText = `The Scrutinizer had been appointed by the Board of Directors of the Company to scrutinize the remote e-voting and e-voting process in respect of the below mentioned resolutions proposed at the ${sessionTitle} of the Company.`;
    const apptLines = doc.splitTextToSize(appointmentText, contentWidth);
    doc.text(apptLines, margin, y);
    y += apptLines.length * 4 + 5;

    const responsibilityText = "The Management of the Company is responsible for ensuring compliances with the provisions of the Companies Act and the Rules framed thereunder, the MCA Circulars and SEBI (LODR) Regulations relating to the voting on the resolution as contained in the notice calling the general meeting. The responsibility of the Scrutinizer is to ensure that the voting process both through remote E-voting as well as by E-voting at the General Meeting is conducted in a fair and transparent manner and to provide a consolidated Scrutinizer's Report of the votes cast \"In Favour\" or \"Against\" the resolutions.";
    const respLines = doc.splitTextToSize(responsibilityText, contentWidth);
    y = ensureSpace(y, respLines.length * 4 + 5);
    doc.text(respLines, margin, y);
    y += respLines.length * 4 + 5;

    doc.setFont("helvetica", "bold");
    doc.text("I hereby submit my report as under:", margin, y);
    y += 8;

    // ================================================================
    // NUMBERED CLAUSES (like the template)
    // ================================================================
    const clauses = [
        `Notice in relation to the aforesaid Meeting was sent by the Company by email to those Members whose emails are registered with the Company.`,
        `The Company had provided the remote e-voting and e-voting facility through its Vote India Secure platform to its Members holding shares as on the cut-off date i.e. ${fmtDate(recordDate || votingStart)} to exercise their right to vote on any or all of the businesses specified in the Notice.`,
        `In accordance with the Notice, the voting through remote e-voting started on ${fmtDateTime(votingStart)} and ended on ${fmtDateTime(votingEnd)}. Thereafter, the e-voting module was disabled.`,
        `The facility of e-voting during the Meeting through VC / OAVM was provided pursuant to MCA Circulars and SEBI (LODR) Regulations.`,
        `The Members who were present at the Meeting through VC/OAVM and who had not voted on remote e-voting were allowed to cast their votes through the e-voting system during the Meeting.`,
        `Total registered shareholders: ${shareholderCount}. Total voting shares on record: ${totalShares.toLocaleString()}.`,
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

    clauses.forEach((clause, idx) => {
        const numStr = `${idx + 1}.   `;
        const lines = doc.splitTextToSize(clause, contentWidth - 10);
        const needed = lines.length * 4 + 5;
        y = ensureSpace(y, needed);
        doc.setFont("helvetica", "bold");
        doc.text(numStr, margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(lines, margin + 8, y);
        y += lines.length * 4 + 4;
    });

    y += 3;

    // ================================================================
    // RESOLUTION-WISE RESULTS (like the MGT-13 template tables)
    // ================================================================
    y = ensureSpace(y, 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    const clauseNum = clauses.length + 1;
    doc.text(`${clauseNum}.   The consolidated results of remote e-voting and e-voting during the meeting are as under:`, margin, y);
    y += 8;

    opts.results.forEach((res, resIdx) => {
        const stat = res.stats || { for: 0, against: 0, abstain: 0, total: 0 };
        const totalValid = (stat.for + stat.against) || 1;
        const forPct = totalValid > 0 ? ((stat.for / totalValid) * 100).toFixed(2) : "0.00";
        const againstPct = totalValid > 0 ? ((stat.against / totalValid) * 100).toFixed(2) : "0.00";
        const resType = res.resolution_type === "special" ? "Special Resolution" : "Ordinary Resolution";

        // Determine if resolution passed
        const isPassed = res.stats.winner !== undefined
            ? res.stats.winner
            : (res.resolution_type === "special"
                ? (stat.for + stat.against > 0 && stat.for >= 3 * stat.against)
                : stat.for > stat.against);

        // Resolution header
        y = ensureSpace(y, 80);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(black[0], black[1], black[2]);
        doc.text(`Resolution No. ${resIdx + 1}, ${resType}:`, margin, y);
        y += 5;

        // Resolution title / description
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        const titleLines = doc.splitTextToSize(res.title + (res.description ? ` — ${res.description}` : ""), contentWidth);
        doc.text(titleLines, margin, y);
        y += titleLines.length * 4 + 5;

        // ---- Table 1: Voted in favour ----
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("1.  Voted in favour of the resolution:", margin, y);
        y += 5;

        autoTable(doc, {
            startY: y,
            margin: { left: margin, right: margin },
            head: [["Type of Voting", "No. of Members\nwho voted", "No. of Votes\ncast by them", "% of total valid\nvotes cast"]],
            body: [
                ["Remote e-voting", stat.for > 0 ? "-" : "0", stat.for.toLocaleString(), `${forPct}%`],
                ["E-voting during\nMeeting", "0", "0", "0.00%"],
                [{ content: "Total", styles: { fontStyle: "bold" } }, { content: stat.for > 0 ? "-" : "0", styles: { fontStyle: "bold" } }, { content: stat.for.toLocaleString(), styles: { fontStyle: "bold" } }, { content: `${forPct}%`, styles: { fontStyle: "bold" } }],
            ],
            theme: "grid",
            headStyles: { fillColor: [240, 240, 240], textColor: black, fontStyle: "bold", fontSize: 8, halign: "center", cellPadding: 2.5, lineColor: borderGray, lineWidth: 0.3 },
            bodyStyles: { fontSize: 8, textColor: darkGray, cellPadding: 2.5, lineColor: borderGray, lineWidth: 0.3 },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 35, halign: "center" },
                2: { cellWidth: 40, halign: "center" },
                3: { cellWidth: 40, halign: "center" },
            },
            tableWidth: contentWidth > 170 ? 170 : contentWidth,
        });
        y = doc.lastAutoTable.finalY + 5;

        // ---- Table 2: Voted against ----
        y = ensureSpace(y, 35);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text("2.  Voted against the resolution:", margin, y);
        y += 5;

        autoTable(doc, {
            startY: y,
            margin: { left: margin, right: margin },
            head: [["Type of Voting", "No. of Members\nwho voted", "No. of Votes\ncast by them", "% of total valid\nvotes cast"]],
            body: [
                ["Remote e-voting", stat.against > 0 ? "-" : "0", stat.against.toLocaleString(), `${againstPct}%`],
                ["E-voting during\nMeeting", "0", "0", "0.00%"],
                [{ content: "Total", styles: { fontStyle: "bold" } }, { content: stat.against > 0 ? "-" : "0", styles: { fontStyle: "bold" } }, { content: stat.against.toLocaleString(), styles: { fontStyle: "bold" } }, { content: `${againstPct}%`, styles: { fontStyle: "bold" } }],
            ],
            theme: "grid",
            headStyles: { fillColor: [240, 240, 240], textColor: black, fontStyle: "bold", fontSize: 8, halign: "center", cellPadding: 2.5, lineColor: borderGray, lineWidth: 0.3 },
            bodyStyles: { fontSize: 8, textColor: darkGray, cellPadding: 2.5, lineColor: borderGray, lineWidth: 0.3 },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 35, halign: "center" },
                2: { cellWidth: 40, halign: "center" },
                3: { cellWidth: 40, halign: "center" },
            },
            tableWidth: contentWidth > 170 ? 170 : contentWidth,
        });
        y = doc.lastAutoTable.finalY + 5;

        // ---- Table 3: Abstain / Invalid ----
        y = ensureSpace(y, 35);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text("3.  Abstained / Invalid Votes:", margin, y);
        y += 5;

        autoTable(doc, {
            startY: y,
            margin: { left: margin, right: margin },
            head: [["Type of Voting", "No. of Members whose\nvotes were abstained/invalid", "Total number of\nabstained/invalid votes"]],
            body: [
                ["Remote e-voting", stat.abstain > 0 ? "-" : "0", stat.abstain.toLocaleString()],
                ["E-voting during\nMeeting", "0", "0"],
                [{ content: "Total", styles: { fontStyle: "bold" } }, { content: stat.abstain > 0 ? "-" : "0", styles: { fontStyle: "bold" } }, { content: stat.abstain.toLocaleString(), styles: { fontStyle: "bold" } }],
            ],
            theme: "grid",
            headStyles: { fillColor: [240, 240, 240], textColor: black, fontStyle: "bold", fontSize: 8, halign: "center", cellPadding: 2.5, lineColor: borderGray, lineWidth: 0.3 },
            bodyStyles: { fontSize: 8, textColor: darkGray, cellPadding: 2.5, lineColor: borderGray, lineWidth: 0.3 },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 55, halign: "center" },
                2: { cellWidth: 55, halign: "center" },
            },
            tableWidth: contentWidth > 170 ? 170 : contentWidth,
        });
        y = doc.lastAutoTable.finalY + 5;

        // Resolution outcome
        y = ensureSpace(y, 12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        if (isPassed) {
            doc.setTextColor(16, 130, 80);
            doc.text(`Resolution No. ${resIdx + 1} is PASSED with requisite majority.`, margin, y);
        } else {
            doc.setTextColor(200, 50, 50);
            doc.text(`Resolution No. ${resIdx + 1} is NOT PASSED / REJECTED.`, margin, y);
        }
        y += 10;
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    });

    // ================================================================
    // FINAL CLAUSE + SIGN-OFF
    // ================================================================
    y = ensureSpace(y, 60);
    const finalClauseNum = clauseNum + 1;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    const finalClause = `${finalClauseNum}.   All electronic records containing a list of equity shareholders who voted through remote e-voting and voting at the Meeting segregated into "For", "Against" and "Abstain" for each resolution is submitted.`;
    const finalLines = doc.splitTextToSize(finalClause, contentWidth);
    doc.text(finalLines, margin, y);
    y += finalLines.length * 4 + 10;

    // Thanking you
    doc.text("Thanking you,", margin, y); y += 5;
    doc.text("Yours faithfully,", margin, y); y += 12;

    // Scrutinizer sign-off block
    y = ensureSpace(y, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text(`For ${csName}`, margin, y); y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Company Secretary / Scrutinizer", margin, y); y += 5;
    if (csMembership) {
        doc.text(`Membership No: ${csMembership}`, margin, y); y += 5;
    }
    doc.text(`Date: ${reportDate}`, margin, y); y += 5;
    doc.text(`Place: Registered Office`, margin, y); y += 10;

    // Authorized Corporate Officer signature (right side)
    const signRightX = pageWidth / 2 + 10;
    let signY = y - 25;
    signY = signY < 20 ? y - 15 : signY;

    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.line(signRightX, signY + 10, pageWidth - margin, signY + 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text("Authorized Corporate Signatory", signRightX, signY + 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(companyName, signRightX, signY + 20);
    doc.text("For & on behalf of the Board", signRightX, signY + 25);

    // ================================================================
    // SUMMARY TABLE (additional executive summary page)
    // ================================================================
    doc.addPage();
    let sy = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text("EXECUTIVE SUMMARY — RESOLUTION OUTCOMES", pageWidth / 2, sy, { align: "center" });
    sy += 3;
    drawLine(sy);
    sy += 8;

    // Company info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(companyName, margin, sy); sy += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(medGray[0], medGray[1], medGray[2]);
    doc.text(`Event: ${sessionTitle} | Voting: ${fmtDate(votingStart)} to ${fmtDate(votingEnd)}`, margin, sy);
    sy += 8;

    // Summary table
    const summaryData = opts.results.map((r, idx) => {
        const s = r.stats || { for: 0, against: 0, abstain: 0, total: 0 };
        const total = s.total || (s.for + s.against + s.abstain) || 1;
        const approvalPct = total > 0 ? ((s.for / total) * 100).toFixed(2) : "0.00";
        const isPassed = s.winner !== undefined
            ? s.winner
            : (r.resolution_type === "special"
                ? (s.for + s.against > 0 && s.for >= 3 * s.against)
                : s.for > s.against);
        return [
            idx + 1,
            r.title,
            r.resolution_type === "special" ? "Special" : "Ordinary",
            s.for.toLocaleString(),
            s.against.toLocaleString(),
            s.abstain.toLocaleString(),
            total.toLocaleString(),
            `${approvalPct}%`,
            isPassed ? "PASSED" : "REJECTED",
        ];
    });

    autoTable(doc, {
        startY: sy,
        margin: { left: margin, right: margin },
        head: [["#", "Resolution / Agenda", "Type", "For", "Against", "Abstain", "Total", "Approval %", "Outcome"]],
        body: summaryData,
        theme: "grid",
        headStyles: {
            fillColor: headerBg,
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 7.5,
            halign: "center",
            cellPadding: 2.5,
        },
        bodyStyles: {
            fontSize: 7.5,
            textColor: darkGray,
            cellPadding: 2.5,
        },
        columnStyles: {
            0: { cellWidth: 8, halign: "center", fontStyle: "bold" },
            1: { cellWidth: 48 },
            2: { cellWidth: 16, halign: "center" },
            3: { cellWidth: 18, halign: "right", textColor: [16, 150, 100], fontStyle: "bold" },
            4: { cellWidth: 18, halign: "right", textColor: [200, 50, 50] },
            5: { cellWidth: 16, halign: "right", textColor: medGray },
            6: { cellWidth: 18, halign: "right", fontStyle: "bold" },
            7: { cellWidth: 18, halign: "center", fontStyle: "bold" },
            8: { cellWidth: 18, halign: "center", fontStyle: "bold" },
        },
        didParseCell: (data) => {
            if (data.section === "body" && data.column.index === 8) {
                if (data.cell.raw === "PASSED") {
                    data.cell.styles.textColor = [16, 150, 100];
                } else {
                    data.cell.styles.textColor = [200, 50, 50];
                }
            }
        },
    });

    sy = doc.lastAutoTable.finalY + 10;

    // Statutory compliance note
    sy = ensureSpace(sy, 25);
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.roundedRect(margin, sy, contentWidth, 18, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text("STATUTORY COMPLIANCE & INTEGRITY CERTIFICATION", margin + 4, sy + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(medGray[0], medGray[1], medGray[2]);
    doc.text("All electronic ballots in this meeting were authenticated, verified, and sealed in accordance with Section 108 of the Companies Act, 2013,", margin + 4, sy + 11);
    doc.text("Rule 20 of the Companies (Management and Administration) Rules, 2014 and SEBI (LODR) Regulation 44.", margin + 4, sy + 15);

    // ---- Add footers to all pages ----
    addFooters();

    // ---- Save ----
    const filename = `${companyName.replace(/[^a-zA-Z0-9]/g, "_")}_MGT13_Scrutinizer_Report.pdf`;
    doc.save(filename);
};

/**
 * Generates an executive Shareholder Roster & Capital Representation PDF
 */
export const generateShareholderRosterPDF = async (opts) => {
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
                }
                else {
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
