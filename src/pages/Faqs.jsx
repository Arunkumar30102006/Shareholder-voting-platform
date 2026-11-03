import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, Search, Users, Building2, Scale, ShieldCheck, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema, createFaqSchema } from "@/components/layout/StructuredData";
const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "FAQs", url: "/faqs" }
]);
const allFaqs = [
    // ─── 1. Shareholder FAQs ───
    {
        id: "sh-1",
        category: "shareholder",
        q: "Who is eligible to participate in electronic shareholder voting?",
        a: "Under Rule 20 of the Companies (Management and Administration) Rules, 2014, eligibility is strictly determined by beneficial ownership on the designated cut-off date (record date). Any person whose name appears on the register of members or in the records of the depositories (CDSL/NSDL) as of the cut-off date is entitled to cast their vote."
    },
    {
        id: "sh-2",
        category: "shareholder",
        q: "How do physical and demat shareholders log in to cast votes?",
        a: "Demat shareholders log in using their Depository Participant ID (DP ID) and Client ID along with their registered PAN and 2FA OTP. Physical shareholders log in using their Folio Number registered with the company's Registrar and Share Transfer Agent (RTA) paired with 2FA OTP sent to their registered contact details."
    },
    {
        id: "sh-3",
        category: "shareholder",
        q: "What is a cut-off date and why does it matter?",
        a: "The cut-off date is a fixed statutory date (not earlier than 7 days before the general meeting) established by the company's Board of Directors. It fixes the voting entitlement and shareholding count of every member. Shares bought or sold after the cut-off date do not alter voting power for that specific meeting."
    },
    {
        id: "sh-4",
        category: "shareholder",
        q: "What voting options are available for each resolution?",
        a: "Shareholders can cast their ballot as FOR (in favor), AGAINST (opposed), or ABSTAIN (neutral). Each vote is weighted proportionally by the number of equity shares held on the cut-off date."
    },
    {
        id: "sh-5",
        category: "shareholder",
        q: "Can I modify my vote after submitting it online?",
        a: "No. In accordance with Rule 20(4)(vii) of the Companies (Management and Administration) Rules, 2014, once a shareholder has cast their vote on a resolution, they are not allowed to change it subsequently."
    },
    {
        id: "sh-6",
        category: "shareholder",
        q: "Do I receive a confirmation or receipt after voting?",
        a: "Yes. Upon submitting a vote, the platform generates a unique cryptographic SHA-256 receipt containing the resolution ID, vote timestamp, and transaction proof. Shareholders can download an official Voting Certificate for their personal records."
    },
    // ─── 2. Corporate Issuer FAQs ───
    {
        id: "is-1",
        category: "issuer",
        q: "Which companies are legally required to provide electronic voting?",
        a: "Under Section 108 of the Companies Act, 2013 read with Rule 20, every listed public company and every unlisted company having not less than one thousand shareholders must provide an electronic voting facility for all general meetings."
    },
    {
        id: "is-2",
        category: "issuer",
        q: "What notice period is required before conducting an e-voting session?",
        a: "Companies must dispatch meeting notices at least 21 clear days prior to the general meeting date (or shorter notice if approved under Section 101). Notice of e-voting must also be published in at least one English newspaper and one vernacular newspaper circulating in the district of the registered office."
    },
    {
        id: "is-3",
        category: "issuer",
        q: "How does the platform ingest shareholder records and depository files?",
        a: "Corporate administrators upload standardized Benpos (Beneficial Position) rosters received from depositories (CDSL/NSDL) or RTA records. The platform automatically calculates each shareholder's voting weight and validates uniqueness."
    },
    {
        id: "is-4",
        category: "issuer",
        q: "How are Ordinary and Special resolutions differentiated during voting?",
        a: "Ordinary resolutions require a simple majority (> 50% of valid votes cast in favor). Special resolutions require a supermajority of not less than three-fourths (≥ 75%) of votes cast in favor under Section 114 of the Companies Act, 2013."
    },
    // ─── 3. Scrutinizer & Legal Compliance FAQs ───
    {
        id: "sc-1",
        category: "scrutinizer",
        q: "What is the statutory role of the independent Scrutinizer?",
        a: "Under Rule 20(4)(ix), the Board appoints an independent Scrutinizer (such as a Practicing Company Secretary, Chartered Accountant, or Advocate) to oversee the entire voting process, verify ballot integrity, unblock tallies with witnesses, and prepare the official Scrutinizer's Report."
    },
    {
        id: "sc-2",
        category: "scrutinizer",
        q: "What is the statutory procedure for unblocking remote e-voting tallies?",
        a: "Rule 20(4)(xii) mandates that the Scrutinizer unblocks the remote e-voting portal after the conclusion of voting at the general meeting, in the presence of at least two independent witnesses who are not in the employment of the company."
    },
    {
        id: "sc-3",
        category: "scrutinizer",
        q: "What is Form MGT-13 and when must it be submitted?",
        a: "Form MGT-13 is the statutory format for the Scrutinizer's Report under Rule 20. The Scrutinizer prepares and submits this report to the Chairman within the prescribed statutory timeframe, detailing valid votes cast in favor, against, and any invalid ballots."
    },
    {
        id: "sc-4",
        category: "scrutinizer",
        q: "Does Vote India Secure submit reports directly to regulatory portals?",
        a: "No. Vote India Secure provides automated vote consolidation and regulatory report export (Form MGT-13 format) for the Scrutinizer and Company Secretary. The official statutory filing with stock exchanges and MCA is executed by the authorized company officials."
    },
    // ─── 4. Security & Cryptography FAQs ───
    {
        id: "sec-1",
        category: "security",
        q: "How is voter privacy and secret ballot maintained?",
        a: "The platform decouples shareholder identity tokens from recorded resolution choices in database storage to preserve ballot secrecy in accordance with Rule 20(4)(xii). Individual vote selections remain sealed until the Scrutinizer unblocks the aggregated tally."
    },
    {
        id: "sec-2",
        category: "security",
        q: "How does the SHA-256 Merkle audit trail prevent tampering?",
        a: "Every vote cast generates a SHA-256 cryptographic hash that is mathematically chained into a Merkle Tree structure. Any retrospective modification of an existing vote would alter the Merkle root, making unauthorized alterations immediately detectable."
    },
    {
        id: "sec-3",
        category: "security",
        q: "How are accounts protected against brute-force and credential abuse?",
        a: "Authentication enforces two-factor authentication (2FA) with time-limited OTPs sent via verified channels. Rate-limiting safeguards and cryptographic hashing prevent automated dictionary or brute-force attacks."
    },
    {
        id: "sec-4",
        category: "security",
        q: "Is Vote India Secure officially certified by government agencies?",
        a: "Vote India Secure is an independent corporate governance software project designed in architectural alignment with Companies Act Section 108 and SEBI LODR Regulation 44. It is not currently accredited by NSDL/CDSL or certified by STQC. We maintain complete transparency regarding our software status."
    }
];
const faqPageSchema = createFaqSchema(allFaqs.map((f) => ({ question: f.q, answer: f.a })));
export const Faqs = () => {
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [openFaq, setOpenFaq] = useState(null);
    const toggleFaq = (id) => {
        setOpenFaq(openFaq === id ? null : id);
    };
    const filteredFaqs = useMemo(() => {
        return allFaqs.filter((item) => {
            const matchesCategory = activeCategory === "all" || item.category === activeCategory;
            const matchesSearch = searchQuery.trim() === "" ||
                item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.a.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchQuery]);
    return (<div className="min-h-screen bg-[#020817] text-white selection:bg-blue-500/30">
      <SEO title="Indian Corporate E-Voting FAQs | Shareholder, Company & Scrutinizer" description="Comprehensive FAQs on Indian corporate e-voting: Companies Act Section 108, Rule 20 timelines, cut-off dates, DP ID / Client ID logins, Scrutinizer Form MGT-13, and security." canonical="/faqs" schemas={[breadcrumbSchema, faqPageSchema]}/>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-cyan-500/15 to-transparent rounded-full blur-[140px]"/>
        </div>

        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6">
              <HelpCircle className="w-4 h-4 text-cyan-400"/>
              <span>Knowledge Base &amp; FAQ Center</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              Corporate E-Voting{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                Knowledge Center
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-200 max-w-3xl mx-auto font-normal leading-relaxed mb-8">
              Authoritative answers to statutory, technical, and operational questions for shareholders, corporate issuers, and independent scrutinizers.
            </p>

            {/* Search Box */}
            <div className="max-w-2xl mx-auto relative mb-8">
              <Search className="w-5 h-5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2"/>
              <input type="text" aria-label="Search FAQs and corporate voting questions" placeholder="Search questions on Section 108, cut-off dates, MGT-13, DP ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-13 pl-12 pr-4 rounded-2xl bg-[#0d1b2a]/90 border border-white/20 text-white placeholder:text-slate-300 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 backdrop-blur-xl transition-all shadow-xl"/>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
              {[
            { id: "all", label: "All Questions", icon: HelpCircle },
            { id: "shareholder", label: "For Shareholders", icon: Users },
            { id: "issuer", label: "For Corporate Issuers", icon: Building2 },
            { id: "scrutinizer", label: "Scrutinizer & Legal", icon: Scale },
            { id: "security", label: "Security & Privacy", icon: ShieldCheck }
        ].map((tab) => (<button key={tab.id} onClick={() => setActiveCategory(tab.id)} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeCategory === tab.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50 border border-blue-400/40"
                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"}`}>
                  <tab.icon className="w-3.5 h-3.5"/>
                  <span>{tab.label}</span>
                </button>))}
            </div>
          </div>
        </div>
      </section>

      {/* Visible FAQ Accordion List */}
      <section className="py-16 bg-[#0d1b2a]/50 border-y border-white/10 relative">
        <div className="container mx-auto px-4 max-w-4xl">
          {filteredFaqs.length === 0 ? (<div className="text-center py-16 bg-[#0d1b2a]/80 rounded-3xl border border-white/10">
              <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50"/>
              <h3 className="text-lg font-bold text-white mb-2">No matching questions found</h3>
              <p className="text-sm text-slate-300 mb-6">
                Try searching for broader keywords like &quot;cut-off&quot;, &quot;Rule 20&quot;, &quot;MGT-13&quot;, or &quot;OTP&quot;.
              </p>
              <Button variant="outline" size="sm" onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
            }} className="border-white/20 text-white">
                Reset Filters
              </Button>
            </div>) : (<div className="space-y-4">
              {filteredFaqs.map((faq) => (<div key={faq.id} className="rounded-2xl border border-white/15 bg-[#0d1b2a]/90 overflow-hidden backdrop-blur-xl transition-all shadow-lg">
                  <button onClick={() => toggleFaq(faq.id)} className="w-full flex items-center justify-between p-5 text-left text-sm md:text-base font-bold text-white hover:text-cyan-300 transition-colors">
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-cyan-400 shrink-0 ml-4 transition-transform duration-300 ${openFaq === faq.id ? "rotate-180" : ""}`}/>
                  </button>
                  <AnimatePresence>
                    {openFaq === faq.id && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                        <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-slate-200 leading-relaxed border-t border-white/10 font-normal">
                          {faq.a}
                        </div>
                      </motion.div>)}
                  </AnimatePresence>
                </div>))}
            </div>)}
        </div>
      </section>

      {/* Internal Navigation Section */}
      <section className="py-16 bg-[#020817]">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Explore Detailed Statutory Guides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <Link to="/remote-e-voting" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Remote E-Voting Guide →
            </Link>
            <Link to="/compliance" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Statutory Compliance →
            </Link>
            <Link to="/security" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              Security Specifications →
            </Link>
            <Link to="/how-it-works" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all text-xs font-semibold text-slate-200 hover:text-cyan-300">
              How It Works →
            </Link>
          </div>
        </div>
      </section>
    </div>);
};
export default Faqs;
