import { Link } from "react-router-dom";
import { Shield, Lock, Mail, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 text-foreground transition-colors duration-300" aria-label="Site footer">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 animate-fade-in-up"
        >
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src="/logo-96.webp" alt="Vote India Secure Logo" width={48} height={48} decoding="async" className="h-12 w-12 object-contain mix-blend-screen rounded-xl" loading="lazy" />
              <div>
                <h2 className="text-xl font-bold">Vote India Secure</h2>
                <p className="text-xs text-muted-foreground">shareholdervoting.in</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {t("footer_desc")}
            </p>
            <div className="bg-background/5 border border-white/10 p-3 rounded-lg mb-4">
              <p className="text-[10px] text-muted-foreground leading-tight">
                <strong>{t("footer_disclaimer").split(':')[0]}:</strong> {t("footer_disclaimer").substring(t("footer_disclaimer").indexOf(':') + 1)}
              </p>
            </div>
            <div className="space-y-2 mb-6">
              <p className="text-xs text-muted-foreground"><strong>Grievance &amp; Support:</strong> support@shareholdervoting.in</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-white bg-green-900/40 px-3 py-1.5 rounded-full border border-green-500/30">
                <Shield className="w-3.5 h-3.5 text-green-400" />
                <span>TLS 1.3 In Transit</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white bg-blue-900/40 px-3 py-1.5 rounded-full border border-blue-500/30">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>SHA-256 Audit Trail</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white bg-purple-900/40 px-3 py-1.5 rounded-full border border-purple-500/30">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>DPDP Act 2023 Aligned</span>
              </div>
            </div>
          </div>

          {/* Solutions Column */}
          <nav aria-label="E-Voting Solutions">
            <h3 className="font-semibold text-lg mb-4 text-white">E-Voting Solutions</h3>
            <ul className="space-y-3">
              {[
                { name: "Shareholder E-Voting", path: "/shareholder-e-voting" },
                { name: "AGM E-Voting", path: "/agm-voting" },
                { name: "EGM Balloting", path: "/egm-voting" },
                { name: "Proxy Voting Solutions", path: "/proxy-voting" },
                { name: "Scrutinizer Audit Tools", path: "/scrutinizer-tools" },
                { name: "Remote E-Voting (Rule 20)", path: "/remote-e-voting" },
                { name: "Corporate Governance", path: "/corporate-voting" },
                { name: "Security Architecture", path: "/security" },
                { name: "How It Works", path: "/how-it-works" },
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="text-sm text-slate-300 hover:text-cyan-300 font-medium transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Statutory Knowledge & Legal */}
          <nav aria-label="Governance and Legal Resources">
            <h3 className="font-semibold text-lg mb-4 text-white">Resources &amp; Law</h3>
            <ul className="space-y-3">
              {[
                { name: "Statutory Knowledge Base", path: "/resources" },
                { name: "Regulatory Framework", path: "/regulatory-framework" },
                { name: "Statutory Compliance", path: "/compliance" },
                { name: "Data Protection Architecture", path: "/data-protection" },
                { name: "Knowledge Center (FAQs)", path: "/faqs" },
                { name: "Blog & Regulatory Analysis", path: "/blog" },
                { name: "Privacy Policy", path: "/privacy-policy" },
                { name: "Terms of Service", path: "/terms-of-service" },
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="text-sm text-slate-300 hover:text-cyan-300 font-medium transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact & Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">{t("footer_contact")}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-200 font-medium">
                <Mail className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                <span>support@shareholdervoting.in</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-200 font-medium">
                <Mail className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                <span>admin@shareholdervoting.in</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200 font-medium">
                <MapPin className="w-4 h-4 text-cyan-400 mt-0.5" aria-hidden="true" />
                <span>India · Corporate Governance &amp; Cloud Operations</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link to="/contact">
                <button className="text-xs font-semibold px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all">
                  Contact Support Desk →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-center text-center text-sm text-slate-300 font-medium">
            <p>© 2026 Vote India Secure. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
