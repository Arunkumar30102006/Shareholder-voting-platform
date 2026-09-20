import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { env } from '@/config/env';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, Presentation, Sparkles, Building, PieChart as PieChartIcon, Activity, User, Hash } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
    PieChart, Pie, Cell, Tooltip, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    BarChart, Bar, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';
import { SEO } from '@/components/layout/SEO';
import { useTranslation } from "react-i18next";
import { DashboardMetrics } from "@/types";

// Chart Colors
const COLORS = ['#8b5cf6', '#3b82f6', '#ec4899', '#10b981'];



export const ShareholderAnalysis = () => {
    const [mounted, setMounted] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [aiInsight, setAiInsight] = useState('');
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            // Shareholder Portal uses custom authentication via localStorage, not supabase.auth
            const shareholderId = localStorage.getItem("shareholderId");

            if (!shareholderId) {
                throw new Error("Not authenticated");
            }

            // 1. Fetch shareholder name and login id first for the header
            const { data: shareholderData, error: shareholderError } = await (supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from('shareholders') as any)
                .select('name, login_id')
                .eq('id', shareholderId)
                .single();

            if (shareholderError || !shareholderData) throw new Error("Could not find shareholder profile mapping");

            // 2. Call the RPC
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase.rpc as any)('get_shareholder_analysis_metrics', {
                _shareholder_id: shareholderId
            });

            if (error) throw error;

            // Merge the base data with the RPC metrics
            const fullMetrics = {
                ...data as unknown as DashboardMetrics,
                shareholder_name: shareholderData.name || shareholderData.shareholder_name || "Shareholder",
                login_id: shareholderData.login_id
            };

            setMetrics(fullMetrics);

        } catch (error: unknown) {
            console.error("Failed to load shareholder metrics", error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateAiInsight = async () => {
        if (!metrics) return;
        setIsGeneratingAi(true);

        const promptText = `
        As a corporate governance analyst AI, analyze these metrics for shareholder ${metrics.shareholder_name}:
        - Shares Owned: ${metrics.total_shares} (${metrics.shareholding_percentage}%)
        - Total Votes Cast: ${metrics.total_votes_cast} out of ${metrics.total_resolutions} eligible resolutions
        - Participation Rate: ${metrics.participation_rate}%
        
        Provide a brief 3-sentence summary of their voting engagement and influence level.
        `;

        try {
            const { data, error } = await supabase.functions.invoke('ai-ops', {
                body: { action: 'chat', payload: { message: promptText } }
            });

            if (error) throw error;
            setAiInsight(data?.result || 'No insight available.');
            toast.success('AI Analysis Generated!');
        } catch (error) {
            console.error('AI Error:', error);
            toast.error('Failed to generate AI insights.');
        } finally {
            setIsGeneratingAi(false);
        }
    };

    if (!mounted) return null;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <SEO
                    title="Analysis Dashboard | Shareholder Portal"
                    description="Shareholder personal voting and shareholding analysis dashboard."
                    canonical="/shareholder-analysis"
                    noindex={true}
                />
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-xl text-muted-foreground animate-pulse">{t("sh_analysis_loading")}</p>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <SEO
                    title="Analysis Dashboard | Shareholder Portal"
                    description="Shareholder personal voting and shareholding analysis dashboard."
                    canonical="/shareholder-analysis"
                    noindex={true}
                />
                <p className="text-xl text-destructive font-semibold">{t("sh_analysis_error")}</p>
                <Button onClick={() => navigate('/shareholder-login')} className="mt-4" variant="outline">{t("sh_analysis_back")}</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
            <SEO
                title="Analysis Dashboard | Shareholder Portal"
                description="Shareholder personal voting and shareholding analysis dashboard."
                canonical="/shareholder-analysis"
                noindex={true}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
                        <Activity className="h-8 w-8 text-purple-400" />
                        {t("sh_analysis_title")}
                    </h1>
                    <p className="text-muted-foreground mt-2 flex items-center gap-2">
                        <User className="h-4 w-4" /> {t("sh_analysis_welcome")} <span className="font-semibold text-foreground">{metrics.shareholder_name}</span>
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground flex items-center justify-end gap-1"><Hash className="h-3 w-3" />Shareholder ID</p>
                        <p className="font-mono bg-white/10 px-3 py-1 rounded-md text-sm mt-1">{metrics.login_id}</p>
                    </div>
                </div>
            </div>

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/5 border-white/10 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Building className="h-4 w-4" /> Total Shares Owned
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{metrics.total_shares.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Represents {metrics.shareholding_percentage}% of company</p>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <PieChartIcon className="h-4 w-4" /> Voting Power
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{metrics.shareholding_percentage}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Overall Influence Score</p>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Presentation className="h-4 w-4" /> {t("sh_analysis_total_votes")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{metrics.total_votes_cast}</div>
                        <p className="text-xs text-muted-foreground mt-1">Out of {metrics.total_resolutions} eligible resolutions</p>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" /> {t("sh_analysis_participation")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{metrics.participation_rate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Historical engagement level</p>
                    </CardContent>
                </Card>
            </div>

            {/* AI Insight Section */}
            <div className="relative group animate-fade-in-up">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-gradient-slow" />
                <Card className="relative bg-[#020817]/90 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-indigo-300">
                        <Sparkles className="h-5 w-5" /> AI Engagement Insights
                    </CardTitle>
                    <CardDescription className="text-indigo-200/60">Generate a dynamic analysis of your voting impact</CardDescription>
                </CardHeader>
                <CardContent>
                    {!aiInsight ? (
                        <Button
                            onClick={generateAiInsight}
                            disabled={isGeneratingAi}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                        >
                            {isGeneratingAi ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Behavior...</> : t("sh_analysis_ai_btn")}
                        </Button>
                    ) : (
                        <div className="prose prose-sm dark:prose-invert prose-p:text-indigo-100 p-4 bg-black/20 rounded-xl backdrop-blur-sm border border-indigo-500/20">
                            <ReactMarkdown>{aiInsight}</ReactMarkdown>
                        </div>
                    )}
                </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Voting Distribution Pie Chart */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/50 to-cyan-500/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                    <Card className="relative h-full bg-[#020817]/80 backdrop-blur-xl border-white/10 rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg text-white">{t("sh_analysis_dist")}</CardTitle>
                            <CardDescription className="text-white/60">{t("sh_analysis_dist_desc")}</CardDescription>
                        </CardHeader>
                    <CardContent className="h-[300px] flex justify-center items-center">
                        {mounted ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={metrics.voting_distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {metrics.voting_distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[260px] w-[260px] rounded-full bg-white/5 animate-pulse" />
                        )}
                    </CardContent>
                    </Card>
                </div>

                {/* Participation Trend Line Chart */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/50 to-pink-500/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                    <Card className="relative h-full bg-[#020817]/80 backdrop-blur-xl border-white/10 rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg text-white">Engagement Timeline</CardTitle>
                            <CardDescription className="text-white/60">Votes cast per active voting session</CardDescription>
                        </CardHeader>
                    <CardContent className="h-[300px]">
                        {mounted ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={metrics.participation_trend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="session" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                                    <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    />
                                    <Line type="monotone" dataKey="votes" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[260px] w-full bg-white/5 rounded-xl animate-pulse" />
                        )}
                    </CardContent>
                    </Card>
                </div>

                {/* Shareholding Comparison Bar Chart */}
                <div className="relative group lg:col-span-2">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/50 via-indigo-500/50 to-purple-500/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                    <Card className="relative h-full bg-[#020817]/80 backdrop-blur-xl border-white/10 rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg text-white">Shareholding Benchmarks</CardTitle>
                            <CardDescription className="text-white/60">Comparing your portfolio size against the company average</CardDescription>
                        </CardHeader>
                    <CardContent className="h-[300px]">
                        {mounted ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={metrics.shareholding_comparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                    <XAxis type="number" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                                    <YAxis dataKey="category" type="category" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} width={100} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar dataKey="amount" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                        {
                                            metrics.shareholding_comparison.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#8b5cf6' : '#3b82f6'} />
                                            ))
                                        }
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[260px] w-full bg-white/5 rounded-xl animate-pulse" />
                        )}
                    </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ShareholderAnalysis;
