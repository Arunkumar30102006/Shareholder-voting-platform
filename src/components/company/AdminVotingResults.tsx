import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { votingApi } from "@/services/api/voting";
import { Resolution, ResolutionStats } from "@/types/voting";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Loader2, Download, FileText, RefreshCw, Trophy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

interface AdminVotingResultsProps {
    sessionId: string;
    companyName: string;
}

export const AdminVotingResults = ({ sessionId, companyName }: AdminVotingResultsProps) => {
    const [mounted, setMounted] = useState(false);
    const { t } = useTranslation();
    const [resolutions, setResolutions] = useState<Resolution[]>([]);
    const [stats, setStats] = useState<Record<string, ResolutionStats>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchResults = async () => {
        setIsLoading(true);
        try {
            const sessionResolutions = await votingApi.getResolutions(sessionId);
            setResolutions(sessionResolutions);

            if (sessionResolutions.length > 0) {
                const resolutionIds = sessionResolutions.map(r => r.id);
                const statsData = await votingApi.getSessionStats(resolutionIds);

                const statsMap: Record<string, ResolutionStats> = {};
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                statsData.forEach((s: any) => {
                    statsMap[s.resolution_id] = s;
                });
                setStats(statsMap);
            }
        } catch (error) {
            console.error("Failed to fetch results:", error);
            toast.error(t("admin_voting_results_toast_load_fail") || "Failed to load voting results");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (sessionId) {
            fetchResults();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    // Real-time subscription
    useEffect(() => {
        if (!sessionId || resolutions.length === 0) return;

        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'votes',
                },
                (payload) => {
                    const newVote = payload.new as { resolution_id: string, vote_value: string, weighted_votes?: number };

                    setStats((prevStats) => {
                        const resolutionId = newVote.resolution_id;
                        if (!resolutions.find(r => r.id === resolutionId)) return prevStats;

                        const currentStat = prevStats[resolutionId] || {
                            resolution_id: resolutionId,
                            for_count: 0,
                            against_count: 0,
                            abstain_count: 0,
                            total_weighted_votes: 0,
                            total_vote_count: 0,
                            last_updated: new Date().toISOString()
                        };

                        const weight = newVote.weighted_votes || 1;
                        let forAdd = 0;
                        let againstAdd = 0;
                        let abstainAdd = 0;

                        if (newVote.vote_value === 'FOR') forAdd = weight;
                        else if (newVote.vote_value === 'AGAINST') againstAdd = weight;
                        else if (newVote.vote_value === 'ABSTAIN') abstainAdd = weight;

                        return {
                            ...prevStats,
                            [resolutionId]: {
                                ...currentStat,
                                for_count: currentStat.for_count + forAdd,
                                against_count: currentStat.against_count + againstAdd,
                                abstain_count: currentStat.abstain_count + abstainAdd,
                                total_weighted_votes: currentStat.total_weighted_votes + weight,
                                total_vote_count: currentStat.total_vote_count + 1
                            }
                        };
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId, resolutions]);

    const refreshData = () => {
        fetchResults();
        toast.success(t("admin_voting_results_toast_refresh") || "Results refreshed");
    };

    const exportPDF = async () => {
        setIsExporting(true);
        try {
            const mappedResults = resolutions.map((res) => {
                const stat = stats[res.id] || { for_count: 0, against_count: 0, abstain_count: 0, total_weighted_votes: 0, total_vote_count: 0 };
                const total = stat.total_weighted_votes || (stat.for_count + stat.against_count + stat.abstain_count) || 0;
                return {
                    id: res.id,
                    title: res.title,
                    description: res.description || null,
                    resolution_type: res.resolution_type,
                    stats: {
                        for: stat.for_count,
                        against: stat.against_count,
                        abstain: stat.abstain_count,
                        total: total,
                        winner: stat.for_count >= stat.against_count,
                    },
                };
            });

            const { generateScrutinizerAuditPDF } = await import("@/lib/pdfReports");
            await generateScrutinizerAuditPDF({
                company: { id: "", company_name: companyName },
                session: { id: sessionId, title: "Annual General Meeting", start_date: new Date().toISOString(), end_date: new Date().toISOString(), is_active: true, meeting_link: null, meeting_password: null, meeting_platform: null, voting_instructions: null, is_meeting_emails_sent: false, meeting_start_date: null, meeting_end_date: null, record_date: null, status: null, description: null },
                results: mappedResults,
            });

            toast.success(t("admin_voting_results_toast_pdf_success") || "Boardroom Scrutinizer Audit Report downloaded!");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error(t("admin_voting_results_toast_pdf_fail") || "Failed to export PDF");
        } finally {
            setIsExporting(false);
        }
    };

    if (!mounted) return null;

    if (isLoading && sessionId) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    if (!sessionId) {
        return (
            <div className="p-12 text-center border border-dashed border-white/20 rounded-3xl bg-black/40">
                <p className="text-slate-200 font-medium">{t("admin_voting_results_empty") || "No active voting session selected"}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-3xl bg-[#0d1b2a]/90 border border-white/20 backdrop-blur-xl shadow-2xl">
                <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-400" />
                        Live General Meeting Results
                    </h2>
                    <p className="text-slate-100 text-xs sm:text-sm mt-0.5 font-normal">Real-time vote tallies and shareholder consensus breakdown</p>
                </div>
                <div className="flex gap-2.5 items-center">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        LIVE FEED
                    </div>
                    <Button variant="outline" size="sm" onClick={refreshData} className="border-white/30 hover:bg-white/10 text-white font-bold rounded-xl text-xs">
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-cyan-400" /> Refresh
                    </Button>
                    <Button size="sm" onClick={exportPDF} disabled={isExporting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md">
                        {isExporting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-1.5" />}
                        Export Scrutinizer PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {resolutions.map((res, index) => {
                    const stat = stats[res.id];
                    const forCount = stat?.for_count || 0;
                    const againstCount = stat?.against_count || 0;
                    const abstainCount = stat?.abstain_count || 0;
                    const totalWeightedVotes = stat?.total_weighted_votes || 0;
                    const totalVoteCount = stat?.total_vote_count || 0;

                    const chartData = [
                        { name: 'For', value: forCount, color: '#10b981' },
                        { name: 'Against', value: againstCount, color: '#ef4444' },
                        { name: 'Abstain', value: abstainCount, color: '#64748b' },
                    ];

                    return (
                        <Card key={res.id} className="border-white/20 bg-[#0d1b2a]/90 backdrop-blur-xl rounded-3xl shadow-xl">
                            <CardHeader className="pb-2 border-b border-white/15">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-xs font-mono text-cyan-300 font-bold mb-1 block">RESOLUTION #{index + 1}</span>
                                        <CardTitle className="text-lg font-black text-white">{res.title}</CardTitle>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-white tabular-nums">{Number(totalWeightedVotes).toLocaleString()}</span>
                                        <span className="text-xs text-slate-200 font-semibold block">Total Shares Cast</span>
                                        <span className="text-[11px] text-cyan-300 font-bold block mt-0.5">
                                            From {totalVoteCount} Shareholders
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="h-[180px] w-full">
                                    {mounted ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff15" />
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="name" type="category" width={60} tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#020817', borderColor: 'rgba(255,255,255,0.2)', color: '#f8fafc', borderRadius: '12px' }}
                                                    cursor={{ fill: '#ffffff08' }}
                                                />
                                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[180px] w-full bg-slate-900/50 rounded-xl animate-pulse" />
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/15 text-center">
                                    <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30">
                                        <p className="text-xs text-emerald-300 font-bold uppercase mb-0.5">Votes In Favor</p>
                                        <p className="text-xl font-black text-emerald-400 tabular-nums">{forCount.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30">
                                        <p className="text-xs text-rose-300 font-bold uppercase mb-0.5">Votes Against</p>
                                        <p className="text-xl font-black text-rose-400 tabular-nums">{againstCount.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-slate-500/15 border border-slate-500/30">
                                        <p className="text-xs text-slate-300 font-bold uppercase mb-0.5">Abstained</p>
                                        <p className="text-xl font-black text-slate-200 tabular-nums">{abstainCount.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {resolutions.length === 0 && (
                    <div className="text-center py-12 text-slate-200 font-medium">
                        No active voting resolutions found for this session.
                    </div>
                )}
            </div>
        </div>
    );
};
