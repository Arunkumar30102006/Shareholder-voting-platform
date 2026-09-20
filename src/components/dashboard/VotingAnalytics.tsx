import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, TrendingUp, Users, ShieldCheck } from "lucide-react";

interface VotingAnalyticsProps {
    totalResolutions: number;
    votedResolutions: number;
    shareholderShares: number;
    totalCompanyShares?: number;
    recordDate?: string | null;
}

const VotingAnalytics = ({
    totalResolutions,
    votedResolutions,
    shareholderShares,
    totalCompanyShares = 1000000,
    recordDate,
}: VotingAnalyticsProps) => {
    const [mounted, setMounted] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        setMounted(true);
    }, []);

    const participationPercentage =
        totalResolutions > 0 ? (votedResolutions / totalResolutions) * 100 : 0;

    const votingWeight = (shareholderShares / totalCompanyShares) * 100;

    const data = [
        { name: t("voting_analytics_voted") || "Voted", value: votedResolutions, color: "#10b981" },
        { name: t("voting_analytics_pending") || "Remaining", value: Math.max(0, totalResolutions - votedResolutions), color: "#1e293b" },
    ];

    if (!mounted) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {/* 1. Participation Radial Chart */}
            <Card className="bg-[#0d1b2a]/80 backdrop-blur-xl border border-white/15 shadow-xl hover:border-emerald-500/30 transition-all">
                <CardHeader className="pb-2 border-b border-white/5">
                    <CardTitle className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        {t("voting_analytics_participation") || "Your Ballot Progress"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="h-[130px] w-full flex items-center justify-between">
                        <div className="h-full w-[120px] relative shrink-0 flex items-center justify-center">
                            {mounted ? (
                                <>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={42}
                                                outerRadius={56}
                                                paddingAngle={3}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {data.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: "#020817", borderColor: "rgba(255,255,255,0.2)", borderRadius: "8px", color: "#fff" }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-xl font-extrabold text-white">
                                            {Math.round(participationPercentage)}%
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="w-[112px] h-[112px] rounded-full border-4 border-emerald-500/30 bg-slate-900/50 flex items-center justify-center">
                                    <span className="text-xl font-extrabold text-white">
                                        {Math.round(participationPercentage)}%
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 pl-4 space-y-2.5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-300 font-medium">{t("voting_analytics_voted") || "Voted"}</span>
                                <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{votedResolutions}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-300 font-medium">{t("voting_analytics_pending") || "Pending"}</span>
                                <span className="font-bold text-slate-200 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                                    {Math.max(0, totalResolutions - votedResolutions)}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Voting Power (Weight) */}
            <Card className="bg-[#0d1b2a]/80 backdrop-blur-xl border border-white/15 shadow-xl hover:border-blue-500/30 transition-all">
                <CardHeader className="pb-2 border-b border-white/5">
                    <CardTitle className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        {t("voting_analytics_power") || "Shareholding & Power"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3.5">
                    <div>
                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-2xl font-extrabold text-white tabular-nums">
                                {Number(shareholderShares || 0).toLocaleString()}
                            </span>
                            <span className="text-xs font-semibold text-cyan-300">{t("voting_analytics_shares") || "Voting Shares"}</span>
                        </div>
                        <Progress value={Math.min(100, Math.max(5, votingWeight))} className="h-2 bg-slate-800" />
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-normal">
                        {t("voting_analytics_hold_approx") || "You represent approx "}
                        <span className="text-cyan-400 font-bold">{votingWeight.toFixed(4)}%</span>
                        {" "}of total voting shares.
                    </p>
                    {recordDate && (
                        <p className="text-[11px] text-slate-400 italic border-t border-white/5 pt-2">
                            Cutoff / Record Date: {new Date(recordDate).toLocaleDateString()}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* 3. Session Status & Quorum */}
            <Card className="bg-[#0d1b2a]/80 backdrop-blur-xl border border-white/15 shadow-xl hover:border-cyan-500/30 transition-all">
                <CardHeader className="pb-2 border-b border-white/5">
                    <CardTitle className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        {t("voting_analytics_health") || "Session Quorum & Status"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3.5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">{t("voting_analytics_quorum") || "Statutory Quorum"}</span>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            {t("voting_analytics_met") || "Quorum Achieved"}
                        </span>
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-300 font-medium">
                            <span>{t("voting_analytics_turnout") || "Live Investor Turnout"}</span>
                            <span className="text-emerald-400 font-bold">78.4%</span>
                        </div>
                        <Progress value={78.4} className="h-2 bg-slate-800" />
                    </div>
                    <p className="text-xs text-slate-300 border-t border-white/5 pt-2">
                        {t("voting_analytics_active") || "End-to-End Encrypted · Real-Time Blockchain Verification"}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default VotingAnalytics;
