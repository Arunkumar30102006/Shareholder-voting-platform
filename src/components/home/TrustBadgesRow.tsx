import { ShieldCheck, Lock, Building2, Award, Globe } from "lucide-react";

const badges = [
  { label: "SHA-256 Cryptographic Audit Ledger", icon: Lock, color: "text-emerald-400" },
  { label: "Workflows Mapped to Sec 108 & Rule 20", icon: Globe, color: "text-blue-400" },
  { label: "Form MGT-13 Aligned Scrutinizer Reports", icon: Award, color: "text-amber-400" },
  { label: "PostgreSQL Row-Level Security", icon: ShieldCheck, color: "text-cyan-400" },
  { label: "Dual-Witness Unblocking Workflow", icon: Building2, color: "text-purple-400" },
];

const TrustBadgesRow = () => {
  return (
    <section className="py-8 md:py-12 relative overflow-hidden" aria-label="Trust and compliance indicators">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {badges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 hover:bg-white/8 transition-all duration-300 group"
            >
              <badge.icon className={`w-4 h-4 ${badge.color} group-hover:scale-110 transition-transform`} aria-hidden="true" />
              <span className="text-xs md:text-sm font-semibold text-white tracking-wide whitespace-nowrap">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadgesRow;
