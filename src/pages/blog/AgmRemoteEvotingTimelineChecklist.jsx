import BlogArticleLayout from "@/components/layout/BlogArticleLayout";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
const statutorySources = [
    { title: "Companies Act 2013 Section 108 / Rule 20 E-Voting - Ministry of Corporate Affairs", url: "https://www.mca.gov.in/content/mca/global/en/acts-rules/ebooks/rules.html" },
    { title: "SEBI LODR Regulation 44 Operational Mandates - SEBI", url: "https://www.sebi.gov.in/legal/regulations/jan-2015/sebi-listing-obligations-and-disclosure-requirements-regulations-2015_26561.html" },
    { title: "MCA Circulars on Virtual & Hybrid General Meetings", url: "https://www.mca.gov.in/content/mca/global/en/acts-rules/ebooks/rules.html" }
];
const AgmRemoteEvotingTimelineChecklist = () => {
    return (<BlogArticleLayout title="Remote E-Voting Timeline for AGM: 30-Day Corporate Secretary Compliance Checklist" description="A definitive 30-day statutory checklist and calendar for Company Secretaries conducting remote e-voting and AGM general meetings under Indian corporate law." canonical="/blog/agm-remote-evoting-timeline-checklist" author="Corporate Secretarial Desk" reviewer="Governance Research Desk" date="2026-08-23" lastUpdated="August 2026" readTime="8 min read" category="AGM Compliance & Operations" keywords="AGM e-voting checklist, remote e-voting 30 day timeline, company secretary e-voting compliance, cut-off date e-voting Rule 20, AGM notice dispatch checklist India" sources={statutorySources}>
      <div className="space-y-6 text-slate-200 leading-relaxed">
        <p className="text-lg text-slate-300 font-medium leading-relaxed">
          Conducting an Annual General Meeting (AGM) with remote e-voting requires precision timing. Under <a href="https://www.mca.gov.in/content/mca/global/en/acts-rules/ebooks/rules.html" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline"><strong>Section 108 of the Companies Act, 2013</strong></a>, <a href="https://www.mca.gov.in/content/mca/global/en/acts-rules/ebooks/rules.html" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline"><strong>Rule 20 of the Companies (Management and Administration) Rules, 2014</strong></a>, and <a href="https://www.sebi.gov.in/legal/regulations/jan-2015/sebi-listing-obligations-and-disclosure-requirements-regulations-2015_26561.html" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline"><strong>SEBI LODR Regulation 44</strong></a>, missing a single statutory deadline can invalidate meeting resolutions or attract regulatory penalties.
        </p>

        <h2 className="text-2xl md:text-3xl font-bold text-white mt-8 mb-4">
          Statutory 30-Day Master Timeline for AGM E-Voting
        </h2>
        <p>
          Below is the chronological operational calendar every Company Secretary and corporate board should follow:
        </p>

        <div className="space-y-4 my-8">
          <div className="p-6 rounded-2xl bg-[#0d1b2a]/90 border border-blue-500/30 flex flex-col md:flex-row gap-4 items-start">
            <div className="px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 font-mono font-bold text-xs shrink-0">
              Day -30 to -25
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1">Board Meeting Approval & Scrutinizer Appointment</h4>
              <p className="text-sm text-slate-300">
                Convene the Board of Directors to approve the AGM Notice, Director's Report, Financial Statements, fix the Cut-Off Date, appoint an independent Scrutinizer, and select the electronic voting agency.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d1b2a]/90 border border-blue-500/30 flex flex-col md:flex-row gap-4 items-start">
            <div className="px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 font-mono font-bold text-xs shrink-0">
              Day -21 (Clear Days)
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1">Dispatch of Notice & Public Newspaper Advertisement</h4>
              <p className="text-sm text-slate-300">
                Dispatch the AGM notice and financial statements electronically to all members, directors, and auditors at least 21 clear days before the meeting date. Publish a public advertisement in at least one vernacular newspaper and one English newspaper having district-wide circulation.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d1b2a]/90 border border-blue-500/30 flex flex-col md:flex-row gap-4 items-start">
            <div className="px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 font-mono font-bold text-xs shrink-0">
              Day -7
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1">Cut-Off Date for Voting Rights Determination</h4>
              <p className="text-sm text-slate-300">
                The cut-off date (record date) cannot be earlier than 7 days before the AGM. Only shareholders holding shares as of this date in depository records (NSDL/CDSL benpos) or physical register are entitled to cast votes.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d1b2a]/90 border border-blue-500/30 flex flex-col md:flex-row gap-4 items-start">
            <div className="px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 font-mono font-bold text-xs shrink-0">
              Day -3 to -1
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1">Remote E-Voting Window Execution</h4>
              <p className="text-sm text-slate-300">
                The remote e-voting window must remain open for at least 3 consecutive days, opening at 9:00 AM on the start date and strictly closing at <strong>5:00 PM on the day immediately preceding the general meeting</strong>. The system must automatically lock at 5:00 PM.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d1b2a]/90 border border-emerald-500/30 flex flex-col md:flex-row gap-4 items-start">
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs shrink-0">
              Day 0 (Meeting Day)
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1">AGM General Meeting & Meeting Poll</h4>
              <p className="text-sm text-slate-300">
                Conduct the general meeting (physically, hybrid, or video conference). Provide e-voting during the meeting for members who did not cast their vote in the remote e-voting window.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d1b2a]/90 border border-purple-500/30 flex flex-col md:flex-row gap-4 items-start">
            <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold text-xs shrink-0">
              Day +1 to +2 (Within 48 Hours)
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-1">Scrutinizer Report (MGT-13) & Stock Exchange Disclosure</h4>
              <p className="text-sm text-slate-300">
                The scrutinizer unblocks the digital vault in the presence of two witnesses and submits Form MGT-13 within 3 working days. Under <strong>SEBI Regulation 44</strong>, listed entities must submit the voting results to BSE and NSE within <strong>48 hours (2 working days)</strong> of the meeting conclusion.
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-white mt-8 mb-4">
          Key Requirements for Public Newspaper Advertisements
        </h2>
        <p>
          As mandated by Rule 20(4)(v), the public newspaper notice must explicitly contain:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Statement that general meeting business will be transacted through electronic voting.</li>
          <li>Date and time of commencement and end of remote e-voting.</li>
          <li>The cut-off date for determining voting eligibility.</li>
          <li>Notice that remote e-voting shall not be allowed beyond 5:00 PM on the closing date.</li>
          <li>Manner of voting for shareholders holding shares in physical mode or who have not registered their email.</li>
          <li>Name, designation, and contact details of the official responsible for addressing e-voting grievances.</li>
        </ul>

        <div className="pt-6">
          <p className="text-sm text-slate-400 mb-4">
            See how Vote India Secure automates the AGM e-voting schedule and cut-off roster synchronization:
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/agm-voting">
              <Button className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-bold gap-2">
                Explore AGM E-Voting Solutions <ArrowRight className="w-4 h-4"/>
              </Button>
            </Link>
            <Link to="/compliance">
              <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white">
                View Full Compliance Matrix
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </BlogArticleLayout>);
};
export default AgmRemoteEvotingTimelineChecklist;
