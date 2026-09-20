import { useState, useEffect } from "react";
import { SEO } from "@/components/layout/SEO";
import { Lock, ChevronRight, Server, Shield, Database, Bell } from "lucide-react";

const sections = [
  { id: "encryption", title: "1. Cryptographic & Storage Encryption" },
  { id: "localisation", title: "2. Data Localisation (India)" },
  { id: "retention", title: "3. Retention Policy" },
  { id: "breach-notification", title: "4. Breach Notification Process" },
  { id: "cert-in", title: "5. CERT-In Compliance" },
];

export default function DataProtection() {
  const [activeSection, setActiveSection] = useState("encryption");

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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 100, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen relative pt-28 pb-20">
      <SEO
        title="Data Protection | Vote India Secure"
        description="Technical details of data protection, encryption, and CERT-In compliance for Vote India Secure."
        canonical="/data-protection"
      />

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-4">
            <Lock className="w-4 h-4" /> Security & Privacy
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Data Protection</h1>
          <p className="text-slate-400">Technical policies safeguarding your voting data.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-12 relative">
          {/* Sticky Sidebar */}
          <aside className="md:w-1/4 hidden md:block">
            <div className="sticky top-28 bg-[#020817]/60 backdrop-blur-md border border-white/10 p-6 rounded-xl">
              <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Table of Contents</h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`block w-full text-left text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-between ${
                      activeSection === section.id
                        ? "bg-blue-500/20 text-blue-400 font-medium"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    {section.title}
                    {activeSection === section.id && <ChevronRight className="w-4 h-4" />}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="md:w-3/4 max-w-3xl prose prose-invert prose-blue">
            <section id="encryption" className="mb-12 scroll-mt-28">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Shield className="w-6 h-6 text-emerald-400" />
                1. Cryptographic &amp; Storage Encryption
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We implement industry-standard cryptographic controls for data protection in transit and at rest.
              </p>
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li><strong>Data at Rest:</strong> Database instances, automated backups, and storage volumes are encrypted at rest using managed cloud volume encryption (AWS KMS AES-256).</li>
                <li><strong>Data in Transit:</strong> All communications between client browsers and edge application servers are encrypted using modern Transport Layer Security (TLS 1.3 supported) with strict HTTPS enforcement.</li>
                <li><strong>Vote Hashes:</strong> Each cast vote undergoes SHA-256 hashing to generate an immutable digital digest linked to a verifiable Merkle audit ledger.</li>
              </ul>
            </section>

            <section id="localisation" className="mb-12 scroll-mt-28">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Server className="w-6 h-6 text-blue-400" />
                2. Data Localisation (Servers in India)
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                In adherence to the Reserve Bank of India (RBI) guidelines on payment data and the Digital Personal Data Protection Act, 2023, Vote India Secure strictly enforces data localisation.
              </p>
              <p className="text-slate-300 leading-relaxed">
                <strong>Primary Datacenter:</strong> Mumbai, Maharashtra (Tier 4)<br />
                <strong>Disaster Recovery (DR) Site:</strong> Bengaluru, Karnataka (Tier 4)<br /><br />
                No personal data, authentication logs, or voting records are ever routed through or stored on servers outside the physical boundaries of the Republic of India.
              </p>
            </section>

            <section id="retention" className="mb-12 scroll-mt-28">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Database className="w-6 h-6 text-amber-400" />
                3. Retention Policy
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Under the Companies (Management and Administration) Rules, 2014, records of electronic voting must be maintained securely.
              </p>
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li><strong>Statutory Retention:</strong> Voting records and scrutinizer reports are retained for the legally mandated period (typically 8 years from the date of the meeting, or as instructed by the client company).</li>
                <li><strong>Data Destruction:</strong> Upon expiry of the retention period, or upon written request from the corporate client terminating the contract, all personal data and voting records are cryptographically wiped (shredded) beyond recovery, and a certificate of destruction is issued.</li>
              </ul>
            </section>

            <section id="breach-notification" className="mb-12 scroll-mt-28">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Bell className="w-6 h-6 text-red-400" />
                4. Breach Notification Process
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                While we maintain rigorous security controls, we have a documented Incident Response Plan in the unlikely event of a data breach.
              </p>
              <p className="text-slate-300 leading-relaxed">
                If a breach affecting personal data occurs, we will:
              </p>
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li>Notify the affected corporate clients without undue delay (target SLA: within 6 hours of discovery).</li>
                <li>Notify the Data Protection Board of India as mandated under the DPDP Act 2023.</li>
                <li>Report the cybersecurity incident to CERT-In within 6 hours as per the April 2022 CERT-In directions.</li>
                <li>Provide a detailed post-incident forensic report and remediation steps.</li>
              </ul>
            </section>

            <section id="cert-in" className="mb-12 scroll-mt-28">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Shield className="w-6 h-6 text-purple-400" />
                5. CERT-In Compliance
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                The Indian Computer Emergency Response Team (CERT-In) is the national nodal agency for responding to computer security incidents.
              </p>
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li><strong>NTP Synchronization:</strong> All our servers sync their system clocks with the Network Time Protocol (NTP) servers provided by NIC or NPL, as mandated by CERT-In.</li>
                <li><strong>Audit Logging:</strong> We maintain comprehensive logs of all ICT systems for a rolling period of 180 days within Indian jurisdiction.</li>
                <li><strong>VAPT:</strong> We undergo regular Vulnerability Assessment and Penetration Testing (VAPT) conducted by CERT-In empaneled security auditors.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
