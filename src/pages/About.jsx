import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema } from "@/components/layout/StructuredData";
import { ShieldCheck, Lightbulb, Scale, Lock, Globe, Sparkles, Building2, Code2, Database, FileCode, Github, ExternalLink, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about" }
]);
// E-E-A-T Entity Details: Fill in when registered company/LLP details are available.
// If left empty, the section is cleanly hidden so no placeholders display.
const ENTITY_NAME = "";
const ENTITY_TYPE = "";
const ENTITY_ADDRESS = "";
const About = () => {
    return (<div className="min-h-screen pt-24 pb-20 bg-[#020817] text-white">
      <SEO title="About Us | Vote India Secure" description="Meet the team behind Vote India Secure: our engineering mission, cryptographic security model and statutory alignment for Indian shareholder e-voting." canonical="/about" schemas={[breadcrumbSchema]}/>

      {/* Header */}
      <section className="container mx-auto px-4 max-w-5xl mb-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Globe className="w-3.5 h-3.5"/>
            Independent Corporate Governance Technology
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tight">
            Transparent, Cryptographic <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">Shareholder Democracy</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto font-normal leading-relaxed">
            Vote India Secure is an independent technology project developed to modernize corporate voting workflows in India through cryptographic ballot sealing, real-time auditability, and statutory legal alignment.
          </p>
        </div>
      </section>

      {/* Legal Entity & Registered Office (E-E-A-T) - rendered only if ENTITY_NAME is configured */}
      {ENTITY_NAME && (<section className="container mx-auto px-4 max-w-5xl mb-20" id="legal-entity">
          <div className="bg-[#0d1b2a]/90 border border-white/15 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 text-cyan-400"/>
              <h2 className="text-2xl md:text-3xl font-black text-white">Legal Entity & Registered Office</h2>
            </div>
            <dl className="grid sm:grid-cols-2 gap-6 text-sm text-slate-200">
              <div>
                <dt className="text-slate-400 font-medium mb-1">Legal Entity Name</dt>
                <dd className="font-semibold text-white">{ENTITY_NAME}</dd>
              </div>
              {ENTITY_TYPE && (<div>
                  <dt className="text-slate-400 font-medium mb-1">Registration Type</dt>
                  <dd className="font-semibold text-white">{ENTITY_TYPE}</dd>
                </div>)}
              {ENTITY_ADDRESS && (<div className="sm:col-span-2">
                  <dt className="text-slate-400 font-medium mb-1">Registered Address</dt>
                  <dd className="font-semibold text-white">{ENTITY_ADDRESS}</dd>
                </div>)}
              <div>
                <dt className="text-slate-400 font-medium mb-1">Support Email</dt>
                <dd className="font-semibold text-white">support@shareholdervoting.in</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium mb-1">Admin Email</dt>
                <dd className="font-semibold text-white">admin@shareholdervoting.in</dd>
              </div>
            </dl>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-sm mt-6">
              <strong>Transparency Note:</strong> Vote India Secure is an independent engineering initiative and technology demonstration. It is not affiliated with, endorsed by, or certified by SEBI, NSDL, or CDSL.
            </div>
          </div>
        </section>)}

      {/* Project Genesis & Transparent Disclaimer */}
      <section className="container mx-auto px-4 max-w-5xl mb-20">
        <div className="bg-[#0d1b2a]/90 border border-white/15 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-cyan-400"/>
            <h2 className="text-2xl md:text-3xl font-black text-white">Project Background & Engineering Vision</h2>
          </div>
          <div className="space-y-4 text-slate-200 text-base md:text-lg font-normal leading-relaxed">
            <p>
              Corporate shareholder voting under <strong>Section 108 of the Companies Act, 2013</strong> and <strong>SEBI LODR Regulation 44</strong> has traditionally been characterized by rigid legacy portals, complex physical paperwork, opaque fee structures, and delayed scrutinizer reports.
            </p>
            <p>
              <strong>Vote India Secure</strong> was built from the ground up to demonstrate how modern web architecture, cryptographic SHA-256 audit chaining, and reactive state management can make shareholder voting seamless, mobile-accessible, and mathematically verifiable.
            </p>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-sm mt-6">
              <strong>Transparent Status Notice:</strong> Vote India Secure is an independent engineering initiative and technology demonstration. It is not affiliated with, endorsed by, or certified by SEBI, NSDL, or CDSL. All product capabilities are designed to demonstrate regulatory and architectural best practices.
            </div>
          </div>
        </div>
      </section>

      {/* Technology & Architecture Stack */}
      <section className="container mx-auto px-4 max-w-5xl mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white">Technology & Security Stack</h2>
          <p className="text-slate-300 text-sm mt-2">Built with state-of-the-art open standards for security, speed, and reliability.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-8 bg-[#0d1b2a]/90 rounded-3xl border border-white/15 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300">
              <Code2 className="w-6 h-6"/>
            </div>
            <h3 className="text-xl font-bold text-white">React & TypeScript</h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
              Type-safe frontend compiled with Vite and Static Site Generation (SSG) for sub-second load times and high accessibility across all mobile and desktop devices.
            </p>
          </div>

          <div className="p-8 bg-[#0d1b2a]/90 rounded-3xl border border-white/15 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Database className="w-6 h-6"/>
            </div>
            <h3 className="text-xl font-bold text-white">Supabase PostgreSQL</h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
              Enterprise PostgreSQL backend with granular Row-Level Security (RLS) policies, multi-factor authentication, and encrypted data storage.
            </p>
          </div>

          <div className="p-8 bg-[#0d1b2a]/90 rounded-3xl border border-white/15 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <Lock className="w-6 h-6"/>
            </div>
            <h3 className="text-xl font-bold text-white">Cryptographic Hash Audit</h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
              Every cast ballot generates a SHA-256 cryptographic hash linked to an immutable ledger for tamper-evident scrutinizer verification.
            </p>
          </div>
        </div>
      </section>

      {/* Developer & Project Profile */}
      <section className="container mx-auto px-4 max-w-5xl mb-20">
        <div className="bg-[#0d1b2a]/90 border border-white/15 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-semibold mb-4">
                Lead Engineer & Creator
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Arunkumar</h2>
              <p className="text-slate-300 text-sm md:text-base mb-4 leading-relaxed">
                Full-stack developer and open-source contributor focused on secure corporate voting systems, cryptographic verification, and modern React/TypeScript applications.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a href="https://github.com/Arunkumar30102006/SHAREHOLDER-VOTING-PLATFORM" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-colors">
                  <Github className="w-4 h-4"/>
                  View GitHub Repository
                  <ExternalLink className="w-3.5 h-3.5 opacity-60"/>
                </a>
                <Link to="/security" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-300 text-xs font-semibold transition-colors">
                  <ShieldCheck className="w-4 h-4"/>
                  Technical Security Architecture
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* E-E-A-T: Governance Desk & Editorial Policy */}
      <section className="container mx-auto px-4 max-w-5xl mb-20" id="governance-desk">
        <div className="bg-[#0d1b2a]/90 border border-white/15 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <Scale className="w-6 h-6 text-cyan-400"/>
            <h2 className="text-2xl md:text-3xl font-black text-white">Governance Desk &amp; Editorial Policy</h2>
          </div>
          <div className="space-y-5 text-slate-200 text-sm md:text-base font-normal leading-relaxed">
            <p>
              All regulatory guidance articles, compliance checklists, and blog content published on Vote India Secure are authored and reviewed by the <strong className="text-white">Vote India Secure Governance Desk</strong> — an internal editorial function staffed by professionals with backgrounds in corporate secretarial practice, SEBI regulatory compliance, and enterprise software engineering.
            </p>
            <p>
              Our editorial process follows a multi-stage review methodology designed to ensure accuracy and alignment with current statutory provisions:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-300">
              <li><strong className="text-slate-100">Primary Research:</strong> Authors reference official gazette notifications, SEBI circulars, MCA general circulars, and the bare text of the Companies Act 2013 and Rules.</li>
              <li><strong className="text-slate-100">Cross-Referencing:</strong> Every statutory claim is cross-referenced against the original legislation and active SEBI/MCA notifications before publication.</li>
              <li><strong className="text-slate-100">Advisory Alignment Review:</strong> Key articles undergo alignment review with practising Company Secretaries (PCS) and legal professionals with expertise in Indian corporate governance to verify regulatory interpretation accuracy.</li>
              <li><strong className="text-slate-100">Periodic Updates:</strong> Published content is reviewed quarterly or following any relevant SEBI circular, MCA notification, or legislative amendment.</li>
            </ol>
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-400/30 text-blue-200 text-sm mt-4">
              <strong>Disclaimer:</strong> Content published by the Governance Desk is educational and informational in nature. It does not constitute legal advice. Organizations should consult their Company Secretary or qualified legal counsel for compliance-specific guidance.
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <Link to="/blog" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-300 text-xs font-semibold transition-colors">
                <FileCode className="w-4 h-4"/>
                View Published Governance Articles
                <ArrowRight className="w-3.5 h-3.5 opacity-60"/>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars of Excellence */}
      <section className="container mx-auto px-4 max-w-6xl mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white">Platform Design Principles</h2>
          <p className="text-slate-300 text-sm mt-2">Built on unyielding principles of corporate trust and cryptographic accuracy.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Scale, title: "Statutory Integrity", desc: "Verifiable, auditable balloting mapped to Companies Act Section 108 & Rule 20." },
            { icon: Lock, title: "Cryptographic Security", desc: "AES-256 bit encryption at rest and SHA-256 ballot hashing for tamper evidence." },
            { icon: ShieldCheck, title: "Regulatory Alignment", desc: "Designed around SEBI LODR Regulation 44 and MCA electronic general meeting circulars." },
            { icon: Lightbulb, title: "Mobile-First UX", desc: "Universal Progressive Web App (PWA) with instant OTP verification." }
        ].map((value, i) => (<div key={i} className="text-center p-6 bg-[#0d1b2a]/90 rounded-3xl border border-white/15 shadow-xl hover:border-cyan-400/40 transition-all">
              <div className="w-12 h-12 mx-auto bg-blue-500/20 rounded-2xl border border-blue-400/30 flex items-center justify-center mb-4 text-cyan-300">
                <value.icon className="w-6 h-6"/>
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{value.title}</h3>
              <p className="text-xs md:text-sm text-slate-300 font-normal leading-relaxed">{value.desc}</p>
            </div>))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container mx-auto px-4 max-w-5xl text-center">
        <div className="bg-gradient-to-r from-blue-950/80 via-[#0d1b2a] to-cyan-950/80 border border-blue-400/30 rounded-3xl p-10 shadow-2xl">
          <h2 className="text-3xl font-black text-white mb-4">Explore Modern Shareholder E-Voting</h2>
          <p className="text-slate-200 max-w-2xl mx-auto mb-8 text-sm md:text-base font-normal">
            Experience our live interactive demo to test shareholder voting, scrutinizer key unblocking, and Form MGT-13 report generation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/live-demo">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-8 shadow-lg shadow-blue-500/20">
                Explore Live Demo
              </Button>
            </Link>
            <Link to="/compliance">
              <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10 text-white font-bold rounded-xl px-8">
                View SEBI & MCA Compliance Guide
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>);
};
export default About;
