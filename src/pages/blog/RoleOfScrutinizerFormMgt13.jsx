import BlogArticleLayout from "@/components/layout/BlogArticleLayout";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, Scale, Users, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
const statutorySources = [
    { title: "Companies Act 2013 Section 108 / Rule 20 - Ministry of Corporate Affairs", url: "https://www.mca.gov.in/content/mca/global/en/acts-rules/ebooks/rules.html" },
    { title: "SEBI LODR Regulation 44 Voting Results - Securities and Exchange Board of India", url: "https://www.sebi.gov.in/legal/regulations/jan-2015/sebi-listing-obligations-and-disclosure-requirements-regulations-2015_26561.html" },
    { title: "Form MGT-13 (Report of Scrutinizer) - MCA E-Book Rules", url: "https://www.mca.gov.in/content/mca/global/en/acts-rules/ebooks/rules.html" }
];
const RoleOfScrutinizerFormMgt13 = () => {
    return (<BlogArticleLayout title="Role of Scrutinizer in E-Voting & Form MGT-13: Statutory Guide for Indian Companies" description="Learn the statutory responsibilities of an independent scrutinizer in shareholder e-voting under Rule 20 and how Form MGT-13 reports are compiled for AGM compliance." canonical="/blog/role-of-scrutinizer-form-mgt-13" author="Governance & Compliance Desk" reviewer="Governance Research Desk" date="2026-08-23" lastUpdated="August 2026" readTime="7 min read" category="Corporate Law & Scrutiny" keywords="scrutinizer e-voting India, Form MGT-13 scrutinizer report, Rule 20 e-voting scrutinizer, independent scrutinizer AGM, vault unblocking e-voting witnesses" sources={statutorySources}>
      <div className="space-y-6 text-slate-200 leading-relaxed font-normal">
        <p className="text-lg text-slate-300 font-normal leading-relaxed">
          In the governance framework of Indian corporate democracy, the <strong>Scrutinizer</strong> acts as an independent statutory custodian who ensures that electronic ballots and postal votes are counted transparently, accurately, and without management bias.
        </p>

        <h2 className="text-2xl md:text-3xl font-bold text-white mt-8 mb-4">
          Statutory Framework Governing Scrutinizer Appointment
        </h2>
        <p>
          Under <a href="https://www.mca.gov.in/content/mca/global/en/acts-rules/ebooks/rules.html" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline"><strong>Section 108 of the Companies Act, 2013</strong></a> read with <a href="https://www.mca.gov.in/content/mca/global/en/acts-rules/ebooks/rules.html" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline"><strong>Rule 20(4)(ix) of the Companies (Management and Administration) Rules, 2014</strong></a> and <a href="https://www.sebi.gov.in/legal/regulations/jan-2015/sebi-listing-obligations-and-disclosure-requirements-regulations-2015_26561.html" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline"><strong>SEBI LODR Regulation 44</strong></a>, the Board of Directors of every company conducting electronic voting must appoint an independent professional as a scrutinizer.
        </p>

        <div className="grid md:grid-cols-3 gap-4 my-6">
          <div className="p-5 rounded-2xl bg-[#0d1b2a]/90 border border-white/10">
            <Scale className="w-6 h-6 text-cyan-400 mb-3"/>
            <h4 className="font-bold text-white text-base mb-1">Eligible Professionals</h4>
            <p className="text-xs text-slate-300">
              Practicing Company Secretary (PCS), Practicing Chartered Accountant (PCA), Cost Accountant, or an Advocate in practice not in the employment of the company.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0d1b2a]/90 border border-white/10">
            <Users className="w-6 h-6 text-emerald-400 mb-3"/>
            <h4 className="font-bold text-white text-base mb-1">Independence Mandate</h4>
            <p className="text-xs text-slate-300">
              The scrutinizer must be a person of repute who can strictly maintain impartiality and ensure the fair conduct of the balloting process.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0d1b2a]/90 border border-white/10">
            <KeyRound className="w-6 h-6 text-purple-400 mb-3"/>
            <h4 className="font-bold text-white text-base mb-1">Dual Witness Rule</h4>
            <p className="text-xs text-slate-300">
              Electronic vaults must only be unlocked in the presence of at least two independent witnesses who are not employees of the company.
            </p>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-white mt-8 mb-4">
          Core Duties of the Scrutinizer During E-Voting
        </h2>
        <ol className="list-decimal pl-6 space-y-4">
          <li>
            <strong>Pre-Meeting Register Verification:</strong> Ensure the master shareholder register and cut-off list provided by the Registrar and Share Transfer Agent (RTA) matches the authorized voting roster.
          </li>
          <li>
            <strong>Monitoring Remote E-Voting:</strong> Verify that the electronic voting window opens at 9:00 AM on the scheduled start date and automatically seals at 5:00 PM on the day prior to the general meeting.
          </li>
          <li>
            <strong>Ballot Vault Unblocking:</strong> Once meeting balloting concludes, unblock the electronic voting system using authorized cryptographic credentials in the presence of two independent witnesses.
          </li>
          <li>
            <strong>Reconciliation & Tabulation:</strong> Count votes cast remotely and votes cast at the general meeting, removing invalid votes or duplicate ballots as per legal provisions.
          </li>
          <li>
            <strong>Drafting Form MGT-13:</strong> Compile the formal Scrutinizer's Report specifying total votes cast, votes in favor, votes against, and invalid votes for each resolution.
          </li>
        </ol>

        <div className="my-8 p-6 rounded-2xl bg-blue-950/40 border border-blue-500/20">
          <h3 className="text-xl font-semibold text-cyan-300 flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5"/> What is Form MGT-13?
          </h3>
          <p className="text-sm text-slate-300">
            <strong>Form MGT-13</strong> is the official statutory template prescribed under the Companies (Management and Administration) Rules, 2014 for reporting the combined results of remote e-voting and meeting balloting. The report is submitted to the Chairman of the meeting or a person authorized by the board within <strong>3 working days</strong> of the meeting conclusion.
          </p>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-white mt-8 mb-4">
          How Vote India Secure Streamlines Scrutinizer Operations
        </h2>
        <p>
          Traditional scrutinizer workflows required manual spreadsheet calculations across depository CDSL/NSDL CSVs and physical ballot slips, leaving room for arithmetic errors. 
          <Link to="/features" className="text-cyan-400 hover:underline font-semibold ml-1">Vote India Secure's Auditor Portal</Link> automates this workflow:
        </p>

        <ul className="list-disc pl-6 space-y-3">
          <li><strong>Digital Vault Unblocking:</strong> Scrutinizers authenticate via secure multi-factor tokens to access encrypted meeting results instantly after the voting window closes.</li>
          <li><strong>Automated Arithmetic Reconciliation:</strong> The platform cross-references folio balances, beneficial ownership lists, and proxy authorisations automatically.</li>
          <li><strong>One-Click Form MGT-13 Generation:</strong> Export compliant, formatted MGT-13 PDF and XBRL summary files ready for immediate board sign-off and BSE/NSE exchange disclosure.</li>
        </ul>

        <div className="pt-6">
          <p className="text-sm text-slate-400 mb-4">
            Explore our auditor verification portal or review our technical compliance documentation:
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/live-demo">
              <Button className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-bold gap-2">
                Test Auditor Portal in Live Demo <ArrowRight className="w-4 h-4"/>
              </Button>
            </Link>
            <Link to="/compliance">
              <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white">
                View SEBI Compliance Matrix
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </BlogArticleLayout>);
};
export default RoleOfScrutinizerFormMgt13;
