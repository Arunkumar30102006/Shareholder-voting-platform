import { useState } from "react";
import { SEO } from "@/components/layout/SEO";
import { 
  organizationSchema, 
  webSiteSchema, 
  homepageSoftwareOrgGraphSchema, 
  createFaqSchema 
} from "@/components/layout/StructuredData";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, Lock, Building2, FileCheck2,
  UploadCloud, Smartphone, HelpCircle, ChevronDown, 
  Sparkles, ArrowRight, Play, Check, Shield,
  Users, BarChart3, Globe, CheckCircle2,
  FileText, ArrowUpRight, BookOpen, Scale,
  KeyRound, Layers
} from "lucide-react";

import StatsSection from "@/components/home/StatsSection";
import TrustBadgesRow from "@/components/home/TrustBadgesRow";
import HeroCyberOrb from "@/components/home/HeroCyberOrb";

const faqItems = [
  {
    question: "How does Vote India Secure support corporate governance requirements?",
    answer: "The platform's technical architecture is mapped to Section 108 of the Companies Act 2013, Rule 20 of the Companies (Management and Administration) Rules 2014, and SEBI LODR Regulation 44. Features include automated weighted voting calculations, cut-off date entitlement validation, and independent scrutinizer unblocking."
  },
  {
    question: "How does online shareholder authentication work?",
    answer: "Shareholders authenticate using their registered Demat credentials (DP ID and Client ID for CDSL/NSDL accounts) or Registered Folio Number paired with registered PAN details, followed by a secure 6-digit keyed OTP dispatched to their registered email or phone."
  },
  {
    question: "What types of general meetings are supported?",
    answer: "The platform provides dedicated workflows for Annual General Meetings (AGM), Extraordinary General Meetings (EGM) requisitioned under Section 100 or Board convened, Postal Ballots under Section 110, and Board/Committee elections."
  },
  {
    question: "How is ballot secrecy and integrity maintained?",
    answer: "Under Rule 20(4)(xii), individual voter ballot selections remain sealed and decoupled from the active voter registry. Each cast ballot generates a SHA-256 cryptographic hash anchored into a verifiable Merkle Tree audit trail. Scrutinizers unblock consolidated results only after the close of voting in the presence of at least two independent witnesses."
  },
  {
    question: "Can shareholders vote using smartphones or tablets?",
    answer: "Yes. Vote India Secure is built as a responsive Progressive Web App (PWA) compatible with all modern mobile, tablet, and desktop web browsers without requiring third-party software downloads or security certificate installations."
  }
];

const audienceCards = [
  {
    title: "For Shareholders",
    subtitle: "Equity & Institutional",
    icon: Users,
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/40",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/30",
    link: "/shareholder-e-voting",
    linkText: "Shareholder E-Voting Guide",
    points: [
      "Secure credential authentication paired with keyed OTP",
      "Instant access on smartphones, tablets, and desktop browsers",
      "Cryptographic vote confirmation receipt with SHA-256 digest",
      "Clear resolution explanatory statements and agenda review"
    ]
  },
  {
    title: "For Corporate Issuers & RTAs",
    subtitle: "Company Secretaries & Boards",
    icon: Building2,
    color: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/40",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/30",
    link: "/company-register",
    linkText: "Register Your Organization",
    points: [
      "Structured AGM, EGM, and Postal Ballot configuration",
      "Automated roster ingestion with record-date share balance lock",
      "Real-time quorum progression tracking without unblocking votes",
      "Section 105 proxy deposit tracking and Form MGT-11 management"
    ]
  },
  {
    title: "For Independent Scrutinizers",
    subtitle: "Legal & Audit Compliance",
    icon: ShieldCheck,
    color: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/40",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    link: "/scrutinizer-tools",
    linkText: "Scrutinizer Audit Tools",
    points: [
      "Rule 20(4)(xii) dual-witness digital unblocking protocol",
      "Consolidated vote exports formatted in alignment with Form MGT-13",
      "Cryptographic Merkle tree audit trail verification",
      "Independent tabulation verification for Ordinary and Special business"
    ]
  }
];

const featuredResources = [
  {
    title: "What is Shareholder E-Voting? Statutory Guide",
    desc: "Comprehensive primer on electronic voting under Companies Act Section 108: legal mandate, physical vs remote comparison, and benefits.",
    href: "/resources/what-is-shareholder-e-voting",
    tag: "Statutory Primer"
  },
  {
    title: "How AGM E-Voting Works Under Section 108",
    desc: "Detailed operational timeline for Annual General Meetings: 21 clear days notice, remote voting window, venue balloting, and quorum.",
    href: "/resources/how-agm-e-voting-works",
    tag: "AGM Operations"
  },
  {
    title: "How EGM E-Voting Works Under Section 100",
    desc: "Statutory procedure for Extraordinary General Meetings: Board requisitions, member requisitions under Section 100, and short notice provisions.",
    href: "/resources/how-egm-e-voting-works",
    tag: "EGM Requisition"
  },
  {
    title: "How Corporate Proxy Voting Works Under Section 105",
    desc: "Legal rights and technical mechanisms of proxy voting under Section 105: Form MGT-11 appointment and entitlement limits.",
    href: "/resources/how-proxy-voting-works",
    tag: "Proxy Voting"
  }
];

const Index = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#020817] text-white selection:bg-blue-500/30">
      <SEO
        title="Shareholder E-Voting Platform for AGMs & EGMs | Vote India Secure"
        description="Secure corporate voting software for Annual General Meetings (AGM), EGMs, and postal ballots with cryptographic ballot integrity and independent scrutinizer reporting."
        canonical="/"
        schemas={[organizationSchema, webSiteSchema, homepageSoftwareOrgGraphSchema, createFaqSchema(faqItems)]}
      />

      {/* ─── 1. HERO SECTION & PLATFORM OVERVIEW ─── */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden" aria-label="Platform overview">
        <HeroCyberOrb />

        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-4xl mx-auto">
            
            {/* Regulatory Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs md:text-sm font-semibold mb-8 shadow-md backdrop-blur-md">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-100">Corporate Governance · Cryptographic Audit Ledger</span>
            </div>

            {/* Main Primary H1 */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
              Shareholder E-Voting{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent drop-shadow-sm">
                Platform for Companies
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-slate-100 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
              Secure corporate voting software for Annual General Meetings (AGM), EGMs, postal ballots, and board elections. Engineered with weighted voting power, cryptographic ballot integrity, and independent scrutinizer audit reporting.
            </p>

            {/* Quick Feature Pills */}
            <div className="flex flex-wrap justify-center gap-2.5 mb-10 max-w-2xl mx-auto">
              {[
                "🔒 SHA-256 Ballot Sealing",
                "⚡ Real-Time Quorum Progression",
                "📜 Scrutinizer Audit Reports",
                "📱 Universal Mobile Access"
              ].map((feat, i) => (
                <span key={i} className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-slate-100 shadow-sm">
                  {feat}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/live-demo" id="hero-live-demo-cta">
                <Button size="xl" className="w-full sm:w-auto bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-bold gap-2 text-base px-8 py-6 rounded-xl shadow-lg shadow-blue-900/40 border border-blue-400/30">
                  <Play className="w-4 h-4 fill-white" />
                  Explore Live Interactive Demo
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/company-register" id="hero-register-cta">
                <Button variant="outline" size="xl" className="w-full sm:w-auto text-base px-8 py-6 rounded-xl border-white/25 hover:bg-white/10 text-white font-semibold gap-2 shadow-sm">
                  Register Your Organization
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 2. TRUST BADGES & VERIFIED METRICS ─── */}
      <TrustBadgesRow />
      <StatsSection />

      {/* ─── 3. WHO WE SERVE (Audience Personas) ─── */}
      <section className="py-20 relative overflow-hidden" aria-label="Platform participants">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-slate-200 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Tailored For Every Corporate Stakeholder
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              Purpose-Built for <span className="text-blue-400">All Participants</span>
            </h2>
            <p className="text-slate-200 text-base md:text-lg font-normal">
              Structured workflows configured to meet the statutory, analytical, and operational needs of shareholders, issuers, and independent scrutinizers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {audienceCards.map((card, index) => (
              <div
                key={card.title}
                className={`p-7 rounded-3xl bg-[#0d1b2a]/80 border ${card.border} backdrop-blur-xl flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300 shadow-xl group`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} border border-white/20 flex items-center justify-center shadow-sm`}>
                      <card.icon className="w-6 h-6 text-white" aria-hidden="true" />
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${card.badgeColor}`}>
                      {card.subtitle}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-4">{card.title}</h3>

                  <ul className="space-y-3 mb-8">
                    {card.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link to={card.link}>
                  <Button variant="outline" className="w-full border-white/20 hover:bg-white/10 text-white font-semibold justify-between group-hover:border-white/40">
                    <span>{card.linkText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. AGM VOTING ARCHITECTURE ─── */}
      <section className="py-20 bg-white/[0.02] border-y border-white/10" aria-label="AGM voting solutions">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
                <Building2 className="w-3.5 h-3.5" />
                Annual General Meetings
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-5 leading-tight">
                Annual General Meeting (AGM) <span className="text-blue-400">E-Voting Solutions</span>
              </h2>
              <p className="text-slate-200 text-sm md:text-base leading-relaxed mb-6 font-normal">
                Conduct statutory AGMs with automated support for 21-day notice dispatches, remote pre-meeting voting windows, and live venue balloting. Handle standard Ordinary Business (financial statement adoption, dividend declarations, director reappointments) and Special Business resolutions seamlessly.
              </p>
              <ul className="space-y-3 mb-8 text-sm text-slate-200">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Configurable remote e-voting window closing at 5:00 PM on the day preceding the AGM</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automatic record-date shareholding snapshot matching depository records</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Separate categorization of Ordinary and Special resolutions with statutory thresholds</span>
                </li>
              </ul>
              <Link to="/agm-voting" id="agm-explore-link">
                <Button className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-semibold gap-2 rounded-xl">
                  Explore AGM E-Voting Platform <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="p-8 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">AGM Statutory Resolution Types</h3>
                    <p className="text-xs text-slate-400">Section 102 &amp; Section 108 Workflows</p>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">Ordinary &amp; Special</span>
              </div>
              <div className="space-y-3 text-xs text-slate-200">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <p className="font-semibold text-white mb-1">Ordinary Business</p>
                  <p className="text-slate-300">Financial statements, auditor appointment, director rotations, and dividend approvals. Simple majority required (&gt;50%).</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <p className="font-semibold text-white mb-1">Special Business</p>
                  <p className="text-slate-300">Capital restructuring, M&amp;A approvals, and Articles of Association amendments. Supermajority required (≥75%).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. EGM VOTING PLATFORM ─── */}
      <section className="py-20" aria-label="EGM voting solutions">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 p-8 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
                    <Scale className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">EGM Requisition Workflows</h3>
                    <p className="text-xs text-slate-400">Section 100 Statutory Mechanics</p>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">Section 100</span>
              </div>
              <div className="space-y-3 text-xs text-slate-200">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <p className="font-semibold text-white mb-1">Board-Convened EGMs</p>
                  <p className="text-slate-300">Urgent matters requiring immediate shareholder determination outside the scheduled AGM cycle.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <p className="font-semibold text-white mb-1">Shareholder Requisitions</p>
                  <p className="text-slate-300">Convened upon requisition of members holding ≥10% of paid-up equity voting capital.</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
                <Scale className="w-3.5 h-3.5" />
                Extraordinary General Meetings
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-5 leading-tight">
                Extraordinary General Meeting (EGM) <span className="text-amber-400">Balloting</span>
              </h2>
              <p className="text-slate-200 text-sm md:text-base leading-relaxed mb-6 font-normal">
                Deploy rapid, legally grounded electronic voting infrastructure for urgent corporate determinations. Whether convened by the Board or requisitioned by eligible shareholders under Section 100, the platform enforces statutory notice periods and precision weighted calculations.
              </p>
              <ul className="space-y-3 mb-8 text-sm text-slate-200">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Support for standard 21-day notice or Section 101(1) 95% majority short notice</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automated eligibility filtering tied to the official EGM cut-off record date</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Independent unblocking and scrutiny identical to statutory AGM standards</span>
                </li>
              </ul>
              <Link to="/egm-voting" id="egm-explore-link">
                <Button className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-semibold gap-2 rounded-xl">
                  Explore EGM E-Voting Platform <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. PROXY VOTING & SECTION 105 MANAGEMENT ─── */}
      <section className="py-20 bg-white/[0.02] border-y border-white/10" aria-label="Corporate proxy voting">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
                <FileCheck2 className="w-3.5 h-3.5" />
                Proxy Governance
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-5 leading-tight">
                Corporate Proxy Voting &amp; <span className="text-cyan-400">Section 105 Management</span>
              </h2>
              <p className="text-slate-200 text-sm md:text-base leading-relaxed mb-6 font-normal">
                Manage proxy appointments digitally in alignment with Section 105 of the Companies Act 2013 and Form MGT-11 standards. Eliminate manual physical proxy reconciliation errors, enforce the 48-hour statutory deposit cutoff, and prevent double voting automatically.
              </p>
              <ul className="space-y-3 mb-8 text-sm text-slate-200">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automated tracking of the statutory 48-hour pre-meeting proxy deposit window</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Enforcement of Rule 19 statutory cap (maximum 50 members and 10% voting capital)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Double-voting prevention: remote shareholder ballots supersede proxy authorizations</span>
                </li>
              </ul>
              <Link to="/proxy-voting" id="proxy-explore-link">
                <Button className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-semibold gap-2 rounded-xl">
                  Explore Proxy Voting Solutions <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="p-8 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
                <FileCheck2 className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Form MGT-11 Alignment</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                The platform records appointed proxy details against member folios, validates depository signatures, and generates consolidated appointment schedules for the Chairman and Scrutinizer.
              </p>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-400">
                <p className="font-semibold text-white mb-1">Key Statutory Principle</p>
                <p>A proxy has no right to speak at a general meeting and cannot vote on a show of hands, but is entitled to cast ballots where authorized by the appointing member.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. SCRUTINIZER AUDIT & REPORTING WORKFLOW ─── */}
      <section className="py-20" aria-label="Scrutinizer tools">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 p-8 rounded-3xl bg-[#0d1b2a]/90 border border-white/15 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Rule 20(4)(xii) Protocol</h3>
                    <p className="text-xs text-slate-400">Independent Unblocking System</p>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">Dual-Witness</span>
              </div>
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>Votes cast through remote e-voting cannot be accessed or tallied by management or the board during the voting window. Under Rule 20(4)(xii), votes remain cryptographically sealed until unblocked by the appointed Scrutinizer in the presence of at least two witnesses not in company employment.</p>
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <p className="font-semibold text-white mb-1">Form MGT-13 Aligned Export</p>
                  <p className="text-slate-400">Consolidated reports tabulating votes cast in favor, votes cast against, and invalid ballots across Ordinary and Special resolutions.</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                Scrutinizer Tools
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-5 leading-tight">
                Independent Scrutinizer Audit &amp; <span className="text-emerald-400">Reporting Portal</span>
              </h2>
              <p className="text-slate-200 text-sm md:text-base leading-relaxed mb-6 font-normal">
                Equip practicing Company Secretaries, Chartered Accountants, and independent scrutinizers with purpose-built tools to verify ballot integrity, maintain statutory registers, and export scrutinizer reports aligned with Form MGT-13 within 48 hours of meeting conclusion.
              </p>
              <ul className="space-y-3 mb-8 text-sm text-slate-200">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dual-witness authentication protocol required for unblocking results</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Cryptographic Merkle tree verification of ballot submission logs</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automated reconciliation of remote e-voting and venue polling ballots</span>
                </li>
              </ul>
              <Link to="/scrutinizer-tools" id="scrutinizer-explore-link">
                <Button className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-semibold gap-2 rounded-xl">
                  View Scrutinizer Portal Capabilities <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. SECURITY ARCHITECTURE & CRYPTOGRAPHIC INTEGRITY ─── */}
      <section className="py-20 bg-white/[0.02] border-y border-white/10" aria-label="Security architecture">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              Transparent Security <span className="text-blue-400">Architecture</span>
            </h2>
            <p className="text-slate-200 text-base md:text-lg font-normal">
              A layered technical security model designed to preserve secret ballots, prevent post-cutoff tampering, and maintain immutable auditability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-[#0d1b2a]/80 border border-white/15 backdrop-blur-xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-6">
                <Lock className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">SHA-256 Ballot Sealing</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Each cast vote generates a deterministic SHA-256 cryptographic digest that is chained into a session-level Merkle Tree. Any modification to a recorded ballot invalidates the root digest.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0d1b2a]/80 border border-white/15 backdrop-blur-xl">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">PostgreSQL Row-Level Security</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Database isolation is enforced at the PostgreSQL engine level via Row-Level Security (RLS) policies. Shareholders can only read resolutions and cast ballots within authorized sessions.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#0d1b2a]/80 border border-white/15 backdrop-blur-xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">TLS 1.3 &amp; Storage Encryption</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                All data in transit is encrypted using TLS 1.3 over HTTPS. Database volumes and persistent storage are encrypted at rest using managed AES-256 disk volume encryption.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link to="/security" id="security-explore-link">
              <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white font-semibold">
                Read Full Technical Security Architecture <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 9. HOW IT WORKS (5-Step Lifecycle) ─── */}
      <section className="py-20" aria-label="End-to-end governance lifecycle">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
              End-to-End Governance <span className="text-blue-400">Lifecycle</span>
            </h2>
            <p className="text-slate-200 text-base font-normal">From meeting notice dispatch to official scrutinizer reporting in five structured steps.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
            {[
              {
                step: "01",
                title: "Roster Setup",
                desc: "Company imports shareholder register as of record cut-off date with weighted share balances.",
                icon: UploadCloud,
              },
              {
                step: "02",
                title: "Notice & Credentials",
                desc: "Notice of meeting dispatched with resolution agendas and secure access instructions.",
                icon: FileText,
              },
              {
                step: "03",
                title: "OTP Verification",
                desc: "Shareholders authenticate via Demat / Folio credentials and keyed 6-digit OTP.",
                icon: KeyRound,
              },
              {
                step: "04",
                title: "Weighted Voting",
                desc: "Shareholders submit FOR/AGAINST ballots; votes are cryptographically sealed with SHA-256.",
                icon: Smartphone,
              },
              {
                step: "05",
                title: "Scrutinizer Export",
                desc: "Scrutinizer unblocks results with two witnesses and exports Form MGT-13 aligned reports.",
                icon: FileCheck2,
              }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-3xl bg-[#0d1b2a]/80 border border-white/15 relative group hover:border-blue-500/40 transition-all shadow-lg flex flex-col justify-between">
                <div>
                  <div className="text-2xl font-black text-cyan-400 mb-3 font-mono">{item.step}</div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-300 text-xs leading-relaxed font-normal">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/how-it-works" id="how-it-works-link">
              <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white font-semibold">
                View Detailed Operational Workflow <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 10. GOVERNANCE RESOURCES & STATUTORY KNOWLEDGE BASE ─── */}
      <section className="py-20 bg-white/[0.02] border-y border-white/10" aria-label="Statutory resources">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              Educational Knowledge Base
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              Corporate Governance &amp; <span className="text-blue-400">Statutory Guides</span>
            </h2>
            <p className="text-slate-200 text-base md:text-lg font-normal">
              In-depth analyses of corporate secretarial procedures, legal precedents, and electronic voting statutory mandates.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {featuredResources.map((res) => (
              <Link 
                key={res.href} 
                to={res.href}
                className="p-7 rounded-3xl bg-[#0d1b2a]/80 border border-white/15 hover:border-blue-400/40 transition-all duration-300 shadow-xl group flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold mb-3 border border-white/15">
                    {res.tag}
                  </span>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {res.title}
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                    {res.desc}
                  </p>
                </div>
                <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                  Read Statutory Guide <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/resources" id="resources-hub-link">
              <Button className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-semibold gap-2 rounded-xl">
                View All Statutory E-Voting Resources <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ ACCORDION ─── */}
      <section className="py-20" aria-label="Frequently asked questions" id="faq">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
              Frequently Asked <span className="text-blue-400">Questions</span>
            </h2>
            <p className="text-slate-200 text-sm md:text-base font-normal">Regulatory and operational answers for corporate boards and secretarial teams.</p>
          </div>

          <div className="space-y-3.5">
            {faqItems.map((faq, index) => (
              <div 
                key={index}
                className="rounded-2xl border border-white/15 bg-[#0d1b2a]/80 overflow-hidden transition-colors shadow-md"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-white text-sm md:text-base hover:text-blue-400 transition-colors"
                  aria-expanded={activeFaq === index}
                  id={`faq-btn-${index}`}
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${activeFaq === index ? "rotate-180 text-blue-400" : ""}`} />
                </button>
                <div
                  className={`px-5 pb-5 text-sm text-slate-100 leading-relaxed border-t border-white/10 pt-3.5 font-normal ${
                    activeFaq === index ? "block" : "hidden"
                  }`}
                  id={`faq-answer-${index}`}
                >
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 11. PRICING & CONSULTATION CALL-TO-ACTION ─── */}
      <section className="py-24 relative overflow-hidden" aria-label="Platform consultation">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="p-10 md:p-16 rounded-3xl bg-gradient-to-br from-[#1e3a8a]/90 via-blue-900/80 to-indigo-950/90 border border-blue-400/40 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              Modernize Your Corporate General Meetings
            </h2>
            <p className="text-blue-100 text-base md:text-lg max-w-xl mx-auto mb-8 font-normal">
              Structured pricing based on registered shareholder roster volume and meeting requirements. Request a demonstration or review event tiers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/contact" className="w-full sm:w-auto inline-block" id="cta-contact-btn">
                <Button size="xl" className="w-full sm:w-auto bg-white text-[#1e3a8a] hover:bg-slate-100 font-bold px-8 py-6 rounded-xl shadow-xl border border-white">
                  Schedule Platform Walkthrough
                </Button>
              </Link>
              <Link to="/pricing" className="w-full sm:w-auto inline-block" id="cta-pricing-btn">
                <Button variant="outline" size="xl" className="w-full sm:w-auto border-white/40 text-white font-semibold hover:bg-white/15 px-8 py-6 rounded-xl">
                  View Transparent Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Index;
