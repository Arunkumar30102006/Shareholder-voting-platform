import { useState, useEffect } from "react";
import { SEO } from "@/components/layout/SEO";
import { FileText, ChevronRight } from "lucide-react";
const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "eligibility", title: "2. Eligibility" },
    { id: "use-platform", title: "3. Use of Platform" },
    { id: "prohibited", title: "4. Prohibited Actions" },
    { id: "limitation", title: "5. Limitation of Liability" },
    { id: "governing-law", title: "6. Governing Law & Dispute Resolution" },
];
export default function TermsOfService() {
    const [activeSection, setActiveSection] = useState("acceptance");
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 150;
            for (const section of sections) {
                const element = document.getElementById(section.id);
                if (element && element.offsetTop <= scrollPosition) {
                    setActiveSection(section.id);
                }
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({ top: element.offsetTop - 100, behavior: "smooth" });
        }
    };
    return (<div className="min-h-screen relative pt-28 pb-20">
      <SEO title="Terms of Service | Vote India Secure" description="Terms of service and user agreement for Vote India Secure platform." canonical="/terms-of-service"/>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-4">
            <FileText className="w-4 h-4"/> Legal & Terms
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-slate-400">Last updated: January 2026</p>
        </div>

        <div className="flex flex-col md:flex-row gap-12 relative">
          {/* Sticky Sidebar */}
          <aside className="md:w-1/4 hidden md:block">
            <div className="sticky top-28 bg-[#020817]/60 backdrop-blur-md border border-white/10 p-6 rounded-xl">
              <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Table of Contents</h3>
              <nav className="space-y-1">
                {sections.map((section) => (<button key={section.id} onClick={() => scrollToSection(section.id)} className={`block w-full text-left text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-between ${activeSection === section.id
                ? "bg-blue-500/20 text-blue-400 font-medium"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}`}>
                    {section.title}
                    {activeSection === section.id && <ChevronRight className="w-4 h-4"/>}
                  </button>))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="md:w-3/4 max-w-3xl prose prose-invert prose-blue">
            <section id="acceptance" className="mb-12 scroll-mt-28">
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                By accessing and using the Vote India Secure platform (the "Platform"), you agree to be bound by these Terms of Service. These terms constitute a legally binding agreement between you (whether an individual shareholder, a corporate entity, or a scrutinizer) and Vote India Secure Technologies Private Limited.
              </p>
              <p className="text-slate-300 leading-relaxed">
                If you do not agree to these terms, please do not use our Platform.
              </p>
            </section>

            <section id="eligibility" className="mb-12 scroll-mt-28">
              <h2 className="text-2xl font-bold text-white mb-4">2. Eligibility</h2>
              <p className="text-slate-300 leading-relaxed mb-4">To use this Platform, you must:</p>
              <ul className="list-disc pl-6 text-slate-300 space-y-2 mb-4">
                <li>Be at least 18 years of age (or the legal age of majority in your jurisdiction).</li>
                <li>Be a verified shareholder as per the records of the Depository (NSDL/CDSL) on the relevant cut-off date.</li>
                <li>Provide accurate, current, and complete identity information during the authentication process.</li>
              </ul>
            </section>

            <section id="use-platform" className="mb-12 scroll-mt-28">
              <h2 className="text-2xl font-bold text-white mb-4">3. Use of Platform</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                The Platform is provided strictly for the purpose of facilitating electronic voting for Annual General Meetings (AGMs), Extraordinary General Meetings (EGMs), and postal ballots in compliance with the Companies Act, 2013 and SEBI regulations.
              </p>
              <p className="text-slate-300 leading-relaxed mb-4">
                As a user, you agree that:
              </p>
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li>Your voting credentials (OTP, passwords) are strictly confidential and must not be shared with any third party.</li>
                <li>Votes once cast and submitted cannot be modified, withdrawn, or reversed, as per statutory guidelines.</li>
                <li>You are solely responsible for ensuring you cast your vote before the closing time of the voting window as defined by the company.</li>
              </ul>
            </section>

            <section id="prohibited" className="mb-12 scroll-mt-28">
              <h2 className="text-2xl font-bold text-white mb-4">4. Prohibited Actions</h2>
              <p className="text-slate-300 leading-relaxed mb-4">Users are strictly prohibited from engaging in the following activities:</p>
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li>Attempting to bypass, disable, or interfere with security-related features of the Platform.</li>
                <li>Impersonating another shareholder, scrutinizer, or company official.</li>
                <li>Using automated scripts, bots, or scrapers to cast votes or extract data.</li>
                <li>Attempting to reverse-engineer the cryptographic hashing or encryption mechanisms.</li>
                <li>Uploading malicious code, viruses, or attempting Denial of Service (DoS) attacks.</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4 font-medium text-red-400">
                Violation of these terms may result in immediate suspension of access and reporting to relevant law enforcement agencies under the Information Technology Act, 2000.
              </p>
            </section>

            <section id="limitation" className="mb-12 scroll-mt-28">
              <h2 className="text-2xl font-bold text-white mb-4">5. Limitation of Liability</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                While we guarantee an uptime of 99.99% and employ enterprise-grade security, Vote India Secure shall not be liable for:
              </p>
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li>Inability to vote due to incorrect records provided by the RTA or Depositories.</li>
                <li>Network failures, ISP outages, or device-level issues on the user's end.</li>
                <li>Indirect, incidental, or consequential damages arising from the use or inability to use the Platform.</li>
              </ul>
            </section>

            <section id="governing-law" className="mb-12 scroll-mt-28">
              <h2 className="text-2xl font-bold text-white mb-4">6. Governing Law & Dispute Resolution</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the Republic of India.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Any dispute, controversy, or claim arising out of or relating to these Terms, or the breach thereof, shall be subject to the exclusive jurisdiction of the competent courts located in <strong>Mumbai, Maharashtra, India</strong>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>);
}
