import BlogArticleLayout from "@/components/layout/BlogArticleLayout";
import { Link } from "react-router-dom";
import { Scale, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
const SebiCompliantEvotingGuide = () => {
    return (<BlogArticleLayout title="Understanding SEBI LODR Regulation 44 and Shareholder E-Voting in India" description="An educational guide to SEBI LODR Regulation 44 and Companies Act Section 108: remote e-voting requirements, cut-off dates, scrutinizer workflows, and reporting." canonical="/blog/sebi-compliant-evoting-guide" author="Corporate Governance Editorial Team" date="2026-08-15" readTime="6 min read" category="Regulatory Analysis" keywords="SEBI LODR Regulation 44 e-voting, Companies Act Section 108 compliance, remote e-voting requirements India, SEBI compliant voting platform, AGM e-voting regulations India">
      <div className="space-y-6 text-slate-200 leading-relaxed font-normal">
        <p className="text-lg text-slate-300 font-normal leading-relaxed">
          In India&apos;s corporate governance framework, electronic voting (e-voting) is a statutory requirement established by the Ministry of Corporate Affairs (MCA) and the Securities and Exchange Board of India (SEBI). This guide provides an educational breakdown of how <strong>Regulation 44 of the SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015</strong> interacts with the <strong>Companies Act, 2013</strong>.
        </p>

        <div className="my-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs md:text-sm">
          <strong>Educational Notice:</strong> This article is published for educational and legal reference purposes. Vote India Secure is an independent software project engineered in architectural alignment with these regulatory standards.
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white mt-8 mb-4">
          The Statutory Framework for Shareholder E-Voting
        </h2>
        <p>
          Electronic voting in India is governed primarily by three interrelated statutes:
        </p>

        <ul className="list-disc pl-6 space-y-3 text-sm md:text-base">
          <li>
            <strong><a href="https://www.mca.gov.in/content/mca/global/en/acts-rules/ebooks/rules.html" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">Section 108 of the Companies Act, 2013</a>:</strong> Mandates that every listed company and every company having not less than 1,000 shareholders must provide members with a facility to exercise their voting rights by electronic means for all general meetings.
          </li>
          <li>
            <strong><a href="https://www.mca.gov.in/content/mca/global/en/acts-rules/ebooks/rules.html" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">Rule 20 of the Companies (Management and Administration) Rules, 2014</a>:</strong> Governs the operational mechanics, 21 clear days notice periods, cut-off date determination (not earlier than 7 days before the meeting), remote voting windows ($\ge$ 3 days, closing 5:00 PM on preceding day), and Scrutinizer appointment.
          </li>
          <li>
            <strong><a href="https://www.sebi.gov.in/legal/regulations/jan-2015/sebi-listing-obligations-and-disclosure-requirements-regulations-2015_26561.html" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">Regulation 44 of SEBI (LODR) Regulations, 2015</a>:</strong> Obligates listed entities to provide remote e-voting facility to all shareholders for all resolutions and submit voting results to the stock exchanges within two working days of the conclusion of the general meeting.
          </li>
        </ul>

        <div className="my-8 p-6 rounded-2xl bg-blue-950/40 border border-blue-500/20">
          <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2 mb-2">
            <Scale className="w-5 h-5"/> Key Provisions of SEBI LODR Regulation 44
          </h3>
          <p className="text-xs md:text-sm text-slate-300">
            Regulation 44(1) mandates that the listed entity shall provide the facility of remote e-voting to its shareholders in respect of all shareholders&apos; resolutions. Regulation 44(3) stipulates that the results must be submitted to the stock exchange(s) within two working days of the conclusion of the general meeting in the prescribed format.
          </p>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white mt-8 mb-4">
          Core Technical Requirements for E-Voting Architecture
        </h2>
        <p>
          To satisfy the statutory objectives of investor transparency and auditability, corporate voting software requires several key capabilities:
        </p>

        <div className="grid md:grid-cols-2 gap-4 my-6">
          <div className="p-5 rounded-2xl bg-[#0d1b2a]/90 border border-white/10">
            <h4 className="font-bold text-white text-base mb-2">1. Cryptographic Audit Chaining</h4>
            <p className="text-xs md:text-sm text-slate-300">
              Votes must generate mathematical hash proofs (such as SHA-256 Merkle trees) ensuring that retrospective tampering is immediately detectable by auditors.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-[#0d1b2a]/90 border border-white/10">
            <h4 className="font-bold text-white text-base mb-2">2. Independent Scrutinizer Access</h4>
            <p className="text-xs md:text-sm text-slate-300">
              The system must provide dedicated access for independent Scrutinizers (PCS/PCA) to unblock tallies in the presence of at least two independent witnesses under Rule 20(4)(xii).
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-[#0d1b2a]/90 border border-white/10">
            <h4 className="font-bold text-white text-base mb-2">3. Weighted Voting Entitlement</h4>
            <p className="text-xs md:text-sm text-slate-300">
              Every shareholder&apos;s vote weight must dynamically match their equity shareholding as of the record cut-off date, integrating depository Benpos records.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-[#0d1b2a]/90 border border-white/10">
            <h4 className="font-bold text-white text-base mb-2">4. Secret Ballot Preservation</h4>
            <p className="text-xs md:text-sm text-slate-300">
              Decoupling voter identity tokens from stored voting choices to ensure individual selections remain confidential until official tally unblocking.
            </p>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white mt-8 mb-4">
          Statutory Compliance Checklist for Secretarial Teams
        </h2>
        <ol className="list-decimal pl-6 space-y-4 text-xs md:text-sm text-slate-300">
          <li>
            <strong>Establish the Cut-Off Date:</strong> Fix a cut-off date not earlier than 7 days before the general meeting date under Rule 20(4)(vii).
          </li>
          <li>
            <strong>Publish Newspaper Advertisements:</strong> Publish notice of e-voting in at least one English newspaper and one vernacular newspaper in the district of the registered office.
          </li>
          <li>
            <strong>Configure 3-Day Remote Voting Window:</strong> Ensure remote e-voting remains active for at least 3 days and concludes at 5:00 PM on the day preceding the meeting.
          </li>
          <li>
            <strong>Two-Witness Scrutinizer Unblocking:</strong> Unblock the digital vault post-meeting in the presence of at least two witnesses who are not in the company&apos;s employment.
          </li>
          <li>
            <strong>Form MGT-13 Report &amp; Exchange Submission:</strong> Complete the Scrutinizer&apos;s Report and submit voting results within two working days under Regulation 44(3).
          </li>
        </ol>

        <div className="my-8 p-6 rounded-2xl bg-[#0d1b2a]/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-white text-base mb-1">Explore Full Compliance Documentation</h4>
            <p className="text-xs text-slate-300">Read our in-depth analysis of Companies Act Section 108 &amp; Rule 20.</p>
          </div>
          <Link to="/compliance">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 text-xs">
              View Compliance Hub <ArrowRight className="w-3.5 h-3.5"/>
            </Button>
          </Link>
        </div>
      </div>
    </BlogArticleLayout>);
};
export default SebiCompliantEvotingGuide;
