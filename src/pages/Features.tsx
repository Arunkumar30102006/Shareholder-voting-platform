import {
  Shield, Lock, Eye, Fingerprint, FileCheck, Globe, Mail, Calendar,
  ArrowRight, CheckCircle2, Vote, Smartphone, BarChart3, QrCode, FileText
} from "lucide-react";
import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema } from "@/components/layout/StructuredData";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Features", url: "/features" }
]);

const mainFeatures = [
  {
    icon: Lock,
    title: "Cryptographic Ballot Integrity",
    description: "All voting data is protected in transit with TLS 1.3 and hashed with SHA-256 digests. Ballots are cryptographically sealed and decoupled in database views, ensuring tamper evidence at all stages.",
    details: [
      "TLS 1.3 transport security",
      "Cryptographic vote hashing with SHA-256",
      "Secure session management with HttpOnly cookies",
      "Decoupled secret ballot architecture"
    ],
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Fingerprint,
    title: "Secure Shareholder Authentication",
    description: "Every shareholder is verified through a structured authentication flow combining roster credentials with keyed OTP verification, preventing unauthorized access.",
    details: [
      "Voter roster credential verification",
      "Keyed HMAC-SHA-256 OTP verification",
      "Auto-invalidation after vote submission",
      "Rate-limited login attempts"
    ],
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: Eye,
    title: "Cryptographic Audit Trails",
    description: "Every vote is recorded with tamper-evident logs, timestamps, and SHA-256 cryptographic hashes. Scrutinizers get independent access to mathematically verify the entire voting process.",
    details: [
      "Complete audit history for every action",
      "Merkle tree anchored verification",
      "Tamper-evident timestamp recording",
      "Independent scrutinizer portal"
    ],
    color: "from-emerald-500 to-green-500",
  },
  {
    icon: Shield,
    title: "SEBI LODR & MCA Alignment",
    description: "Built in architectural adherence to SEBI (LODR) Regulations 2015 and Companies Act 2013, including Regulation 44 for remote e-voting at general meetings.",
    details: [
      "Regulation 44 — e-voting requirements",
      "Section 108 — Companies Act compliance",
      "Rule 20 — Management & Administration Rules",
      "Form MGT-13 Scrutinizer report export"
    ],
    color: "from-blue-600 to-indigo-500",
  },
  {
    icon: FileCheck,
    title: "Scrutinizer Audit Reports",
    description: "Generate Form MGT-13 style scrutinizer reports in PDF format with a single click, including vote breakdowns, cryptographic audit trails, and witness attestation blocks.",
    details: [
      "One-click PDF report generation",
      "Weighted vote calculation engine",
      "Resolution-wise breakdown",
      "Form MGT-13 format compatibility"
    ],
    color: "from-purple-500 to-violet-500",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description: "Access the platform in multiple global languages to ensure every shareholder can participate comfortably regardless of language preference.",
    details: [
      "English, Spanish, French, Mandarin support",
      "Dynamic language switching",
      "Localized UI components",
      "Accessible to all shareholders"
    ],
    color: "from-teal-500 to-cyan-500",
  },
  {
    icon: Smartphone,
    title: "Multi-Device Access",
    description: "Vote securely from any device — desktop, tablet, or mobile. Responsive design ensures a seamless experience across all screen sizes.",
    details: [
      "Fully responsive web application",
      "Progressive Web App (PWA) enabled",
      "Works on all modern browsers",
      "Optimized for low-bandwidth connections"
    ],
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Mail,
    title: "Automated Email System",
    description: "Shareholders receive credentials, meeting invitations, and voting reminders automatically. Companies can track delivery status in real-time.",
    details: [
      "Credential delivery via email",
      "AGM/EGM meeting invitations",
      "Voting reminder notifications",
      "Delivery status tracking"
    ],
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Calendar,
    title: "Flexible Scheduling",
    description: "Companies can configure custom voting windows with automatic start and end times, supporting AGMs, EGMs, and Postal Ballot events.",
    details: [
      "Custom voting window configuration",
      "AGM / EGM / Postal Ballot support",
      "Automatic session activation & closure",
      "Timezone-aware scheduling"
    ],
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: BarChart3,
    title: "AI-Powered Analytics",
    description: "Advanced analytics dashboard powered by AI for document summarization, sentiment analysis, and shareholder engagement insights.",
    details: [
      "AI document summarizer",
      "Shareholder sentiment analysis",
      "Participation trend tracking",
      "Executive insight generation"
    ],
    color: "from-cyan-500 to-teal-500",
  },
  {
    icon: QrCode,
    title: "QR Code Verification",
    description: "Every vote generates a unique QR code that can be scanned to verify the cryptographic integrity of the vote on the immutable ledger.",
    details: [
      "Unique QR per vote receipt",
      "Scan to verify vote integrity",
      "Cryptographic hash validation",
      "Portable verification proof"
    ],
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: FileText,
    title: "Proxy Voting & Delegation",
    description: "Shareholders who can't attend can delegate their voting rights to a trusted proxy. The platform manages the full delegation workflow securely.",
    details: [
      "Digital proxy appointment",
      "Secure delegation workflow",
      "Proxy vote tracking",
      "Compliance with Section 105"
    ],
    color: "from-rose-500 to-pink-500",
  },
];

const Features = () => {
  return (
    <div className="min-h-screen relative">
      <SEO
        title="Features | Shareholder Voting Platform Capabilities"
        description="Explore Vote India Secure's platform capabilities: cryptographic vote integrity, real-time quorum analytics, statutory compliance, and multi-channel voter engagement."
        canonical="/features"
        schemas={[breadcrumbSchema]}
      />
      <main className="container mx-auto px-4 pt-28 pb-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center space-y-4 md:space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium shadow-sm">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Platform Capabilities</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Everything You Need for{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
                Secure E-Voting
              </span>
            </h1>
            <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto">
              A comprehensive platform built to handle every aspect of corporate electronic voting — from shareholder
              authentication to scrutinizer reports, fully aligned with global regulations.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group relative bg-[#0d1b2a]/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  {/* Details List */}
                  <ul className="space-y-2">
                    {feature.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-2 text-xs text-slate-500">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* SEBI Compliance Callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#020817]/60 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-white/10 mb-16 relative group overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <Vote className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
                Statutory Alignment with Indian Corporate Governance
              </h2>
              <p className="text-slate-200 leading-relaxed mb-6 font-normal">
                Every architectural capability is engineered in strict compliance with Section 108 of the Companies Act 2013, Rule 20 of the Companies (M&amp;A) Rules 2014, SEBI LODR Regulation 44, Form MGT-13 standards, and India's Digital Personal Data Protection (DPDP) Act 2023.
              </p>
              <Link to="/compliance">
                <Button variant="outline" className="gap-2 border-white/20 hover:bg-white/10 text-cyan-300 font-bold rounded-xl">
                  View Compliance &amp; Regulatory Framework
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Register your company in minutes and start conducting secure, compliant shareholder voting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/company-register">
                <Button variant="hero" size="xl" className="w-full sm:w-auto gap-2">
                  Register Your Company
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="xl" className="w-full sm:w-auto gap-2">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Features;
