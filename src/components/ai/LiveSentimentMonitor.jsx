import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, ThumbsUp, ThumbsDown, Minus, Sparkles, Send, Loader2, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { env } from '@/config/env';
const INITIAL_DEMO_FEEDBACK = [
    {
        id: '1',
        author: 'Institutional Fund Manager (Folio #IN300128)',
        content: 'We welcome the 20% dividend increase and debt repayment timeline outlined in Resolution 2. Transparent capital allocation.',
        sentiment_label: 'Positive',
        sentiment_score: 0.88,
        theme: 'Dividends & Capital',
        created_at: new Date(Date.now() - 1000 * 60 * 3).toISOString()
    },
    {
        id: '2',
        author: 'Retail Shareholder (Folio #12044700)',
        content: 'Independent director profile in Item 4 has strong cybersecurity expertise, perfectly suited for the digital banking expansion.',
        sentiment_label: 'Positive',
        sentiment_score: 0.76,
        theme: 'Board Appointments',
        created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString()
    },
    {
        id: '3',
        author: 'Proxy Advisory Representative',
        content: 'Explanatory statement for related party contract lacks detailed comparative benchmarking against market rates. Requesting clarification.',
        sentiment_label: 'Negative',
        sentiment_score: -0.65,
        theme: 'Related Party (RPT)',
        created_at: new Date(Date.now() - 1000 * 60 * 14).toISOString()
    },
    {
        id: '4',
        author: 'NRI Investor (Folio #IN302927)',
        content: 'The mobile e-voting interface works seamlessly from Dubai. Two-factor OTP was delivered within 5 seconds.',
        sentiment_label: 'Positive',
        sentiment_score: 0.94,
        theme: 'E-Voting Experience',
        created_at: new Date(Date.now() - 1000 * 60 * 22).toISOString()
    },
    {
        id: '5',
        author: 'Domestic Retail Investor (Folio #13012400)',
        content: 'Clarification needed on the proposed employee stock option exercise window and vesting schedule in Resolution 5.',
        sentiment_label: 'Neutral',
        sentiment_score: 0.05,
        theme: 'ESOP Scheme',
        created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString()
    }
];
const SAMPLE_INJECTORS = [
    { label: 'Dividend Praise', text: 'Excellent dividend payout of ₹18/share. Commend the Board for prioritizing shareholder returns.' },
    { label: 'Capex Question', text: 'What is the projected IRR on the ₹3,500 Cr green hydrogen expansion under Resolution 3?' },
    { label: 'Remuneration Concern', text: 'Executive remuneration hike seems high compared to peer industry benchmarks in this quarter.' }
];
export const LiveSentimentMonitor = () => {
    const [feedback, setFeedback] = useState(INITIAL_DEMO_FEEDBACK);
    const [inputText, setInputText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [stats, setStats] = useState({ positive: 3, neutral: 1, negative: 1, total: 5 });
    useEffect(() => {
        fetchInitialData();
        // Subscribe to real-time updates from Supabase
        const channel = supabase
            .channel('public:shareholder_feedback')
            .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'shareholder_feedback',
        }, (payload) => {
            const newItem = payload.new;
            addFeedbackItem(newItem);
            toast.info('New shareholder feedback streamed in real-time!');
        })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const fetchInitialData = async () => {
        try {
            const { data, error } = await supabase
                .from('shareholder_feedback')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(30);
            if (!error && data && data.length > 0) {
                const merged = [...data, ...INITIAL_DEMO_FEEDBACK.slice(data.length)];
                setFeedback(merged);
                calculateStats(merged);
            }
            else {
                calculateStats(INITIAL_DEMO_FEEDBACK);
            }
        }
        catch {
            calculateStats(INITIAL_DEMO_FEEDBACK);
        }
    };
    const addFeedbackItem = (item) => {
        setFeedback((prev) => {
            const newFeedback = [item, ...prev].slice(0, 40);
            calculateStats(newFeedback);
            return newFeedback;
        });
    };
    const calculateStats = (items) => {
        const newStats = items.reduce((acc, item) => {
            if (item.sentiment_label === 'Positive')
                acc.positive++;
            else if (item.sentiment_label === 'Negative')
                acc.negative++;
            else
                acc.neutral++;
            acc.total++;
            return acc;
        }, { positive: 0, neutral: 0, negative: 0, total: 0 });
        setStats(newStats);
    };
    const handleInjectFeedback = async (customText) => {
        const textToSend = customText || inputText;
        if (!textToSend.trim())
            return;
        setIsAnalyzing(true);
        setInputText('');
        try {
            // Call AI sentiment analysis
            const { data, error } = await supabase.functions.invoke('ai-ops', {
                body: {
                    action: 'sentiment',
                    payload: { text: textToSend }
                },
                headers: {
                    "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`
                }
            });
            let label = 'Neutral';
            let score = 0;
            let theme = 'General AGM';
            if (!error && data?.result) {
                const res = typeof data.result === 'object' ? data.result : {};
                label = res.sentiment || (textToSend.toLowerCase().includes('good') || textToSend.toLowerCase().includes('praise') ? 'Positive' : 'Neutral');
                score = typeof res.score === 'number' ? res.score : (label === 'Positive' ? 0.8 : label === 'Negative' ? -0.6 : 0);
                theme = (res.themes && res.themes[0]) || 'AGM Q&A';
            }
            const newItem = {
                id: `sim-${Date.now()}`,
                author: 'Shareholder Portal (Live Vote)',
                content: textToSend,
                sentiment_label: label,
                sentiment_score: score,
                theme,
                created_at: new Date().toISOString()
            };
            addFeedbackItem(newItem);
            toast.success(`Sentiment Analyzed: ${label}`);
        }
        catch {
            const fallbackItem = {
                id: `sim-${Date.now()}`,
                author: 'Shareholder Portal (Live Vote)',
                content: textToSend,
                sentiment_label: textToSend.toLowerCase().includes('praise') || textToSend.toLowerCase().includes('excellent') ? 'Positive' : 'Neutral',
                sentiment_score: 0.75,
                theme: 'AGM Discussion',
                created_at: new Date().toISOString()
            };
            addFeedbackItem(fallbackItem);
        }
        finally {
            setIsAnalyzing(false);
        }
    };
    const getSentimentColor = (label) => {
        switch (label) {
            case 'Positive':
                return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
            case 'Negative':
                return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
            default:
                return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
        }
    };
    const getSentimentIcon = (label) => {
        switch (label) {
            case 'Positive':
                return <ThumbsUp className="w-3 h-3 text-emerald-400"/>;
            case 'Negative':
                return <ThumbsDown className="w-3 h-3 text-rose-400"/>;
            default:
                return <Minus className="w-3 h-3 text-amber-400"/>;
        }
    };
    const netScore = stats.total > 0 ? Math.round(((stats.positive - stats.negative) / stats.total) * 100) : 0;
    return (<div className="space-y-6">
      {/* Top Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase font-semibold">Net Sentiment Index</span>
            <Activity className="w-4 h-4 text-cyan-400"/>
          </div>
          <p className="text-2xl font-black text-white tabular-nums">
            {netScore > 0 ? `+${netScore}%` : `${netScore}%`}
          </p>
          <span className="text-[11px] text-emerald-400 font-medium">Favorable Boardroom Alignment</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase font-semibold">Positive Feedback</span>
            <ThumbsUp className="w-4 h-4 text-emerald-400"/>
          </div>
          <p className="text-2xl font-black text-emerald-400 tabular-nums">
            {stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0}%
          </p>
          <span className="text-[11px] text-slate-400">{stats.positive} of {stats.total} total items</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase font-semibold">Neutral Inquiries</span>
            <Minus className="w-4 h-4 text-amber-400"/>
          </div>
          <p className="text-2xl font-black text-amber-400 tabular-nums">
            {stats.total > 0 ? Math.round((stats.neutral / stats.total) * 100) : 0}%
          </p>
          <span className="text-[11px] text-slate-400">{stats.neutral} procedural questions</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase font-semibold">Risk Flags / Dissent</span>
            <ThumbsDown className="w-4 h-4 text-rose-400"/>
          </div>
          <p className="text-2xl font-black text-rose-400 tabular-nums">
            {stats.total > 0 ? Math.round((stats.negative / stats.total) * 100) : 0}%
          </p>
          <span className="text-[11px] text-slate-400">{stats.negative} critical concerns</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Injector / Test Box */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-xl h-full flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400"/>
                Live Sentiment Analyzer
              </CardTitle>
              <CardDescription className="text-xs text-slate-300">
                Test shareholder feedback or stream live meeting comments.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <Input placeholder="Type shareholder comment or question..." value={inputText} onChange={(e) => setInputText(e.target.value)} className="bg-white/5 border-white/10 text-white text-xs h-10" onKeyDown={(e) => {
            if (e.key === 'Enter')
                handleInjectFeedback();
        }}/>

                <Button onClick={() => handleInjectFeedback()} disabled={isAnalyzing || !inputText.trim()} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold gap-2 py-4 rounded-xl shadow-md">
                  {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Send className="w-3.5 h-3.5"/>}
                  Analyze &amp; Stream to Telemetry
                </Button>
              </div>

              {/* Sample Injector Pills */}
              <div className="pt-4 border-t border-white/10">
                <span className="text-[11px] text-slate-400 block mb-2 font-semibold uppercase tracking-wider">
                  Sample Meeting Comments:
                </span>
                <div className="space-y-2">
                  {SAMPLE_INJECTORS.map((inj, idx) => (<button key={idx} type="button" onClick={() => handleInjectFeedback(inj.text)} className="w-full text-left p-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:bg-white/10 transition-all text-xs text-slate-300">
                      <span className="font-bold text-white block mb-0.5">{inj.label}</span>
                      <span className="text-[11px] text-slate-400 line-clamp-1">{inj.text}</span>
                    </button>))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Live Feed Stream */}
        <div className="lg:col-span-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-xl flex flex-col h-full">
            <CardHeader className="pb-3 border-b border-white/10 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400"/>
                  Live Meeting Feedback Telemetry
                </CardTitle>
                <CardDescription className="text-xs text-slate-300">
                  Real-time sentiment polarity and thematic tagging during general meetings.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/40 bg-emerald-500/10 text-xs gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400"/>
                LIVE STREAM
              </Badge>
            </CardHeader>

            <CardContent className="p-0 flex-1">
              <ScrollArea className="h-[380px] p-4">
                <div className="space-y-3">
                  {feedback.map((item) => (<div key={item.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-colors">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 flex items-center gap-1 border ${getSentimentColor(item.sentiment_label)}`}>
                            {getSentimentIcon(item.sentiment_label)}
                            {item.sentiment_label}
                          </Badge>
                          {item.theme && (<span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-medium">
                              {item.theme}
                            </span>)}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-1.5 font-normal">
                        {item.content}
                      </p>

                      {item.author && (<span className="text-[10px] text-slate-400 font-medium block">
                          — {item.author}
                        </span>)}
                    </div>))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);
};
export default LiveSentimentMonitor;
