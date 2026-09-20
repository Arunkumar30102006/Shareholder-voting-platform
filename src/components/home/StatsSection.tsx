import { Vote, Building2, Activity, ShieldCheck } from "lucide-react";

interface StatItem {
  value: string;
  label: string;
  icon: typeof Vote;
  color: string;
}

const stats: StatItem[] = [
  { value: "SHA-256", label: "Cryptographic Ballot Integrity", icon: ShieldCheck, color: "text-emerald-400" },
  { value: "Sec 108", label: "Companies Act Workflow Mapping", icon: Building2, color: "text-blue-400" },
  { value: "MGT-13", label: "Aligned Scrutinizer Report Format", icon: Vote, color: "text-amber-400" },
  { value: "OTP", label: "Secure Shareholder Authentication", icon: Activity, color: "text-cyan-400" },
];

const StatCard = ({ stat }: { stat: StatItem }) => {
  return (
    <div className="text-center group">
      <div className="flex justify-center mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <stat.icon className={`w-5 h-5 ${stat.color}`} aria-hidden="true" />
        </div>
      </div>
      <p className="text-3xl md:text-4xl font-extrabold text-white mb-1.5 tracking-tight tabular-nums">
        {stat.value}
      </p>
      <p className="text-xs md:text-sm text-slate-200 font-semibold tracking-wide">{stat.label}</p>
    </div>
  );
};

const StatsSection = () => {
  return (
    <section className="py-16 md:py-20 relative overflow-hidden" aria-label="Platform statistics">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/3 to-primary/5" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="bg-[#0d1b2a]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
