import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/layout/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentSummarizer } from "@/components/ai/DocumentSummarizer";
import { ResolutionDrafter } from "@/components/ai/ResolutionDrafter";
import { LiveSentimentMonitor } from "@/components/ai/LiveSentimentMonitor";
import { GovernanceTranslator } from "@/components/ai/GovernanceTranslator";
import { 
  Sparkles, 
  FileText, 
  BrainCircuit, 
  ArrowLeft, 
  Scale, 
  Languages, 
  ShieldCheck, 
  Activity, 
  BarChart3, 
  Building2, 
  CheckCircle2,
  Lock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AIPowerSuite = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("summarizer");

  return (
    <div className="min-h-screen bg-[#020817] text-white selection:bg-blue-500/30 flex flex-col justify-between">
      <SEO
        title="AI Governance & Power Suite | Vote India Secure"
        description="AI-powered corporate governance suite for AGM resolution drafting, Section 102 explanatory statements, document risk analysis, and multilingual shareholder translation."
        canonical="/ai-power-suite"
        noindex={true}
      />

      <main className="pt-32 pb-20 flex-1">
        {/* Ambient Glows */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-purple-600/20 via-cyan-500/15 to-transparent rounded-full blur-[140px]" />
          <div className="absolute top-1/3 -left-32 w-80 h-80 bg-blue-700/15 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 bg-teal-600/15 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Enterprise Boardroom Intelligence &amp; Statutory AI</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                AI Power{" "}
                <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  Governance Suite
                </span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-3xl mt-2 font-normal leading-relaxed">
                Comprehensive AI intelligence center for corporate secretaries, scrutinizers, and directors. Draft statutory resolutions, analyze annual report risks, translate notices, and monitor live shareholder sentiment.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/company-dashboard")}
                className="border-white/15 text-white hover:bg-white/10 gap-2 text-xs rounded-xl"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Company Dashboard
              </Button>
              <Button
                onClick={() => navigate("/voting-management")}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs gap-2 rounded-xl shadow-lg shadow-blue-900/30"
              >
                <Building2 className="w-3.5 h-3.5" />
                Voting Management
              </Button>
            </div>
          </div>

          {/* Executive Governance KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-xl">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Statutory Compliance
                  </span>
                  <p className="text-xl font-bold text-white">Companies Act 2013</p>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Section 108 &amp; Rule 20
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-xl">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Resolution Engine
                  </span>
                  <p className="text-xl font-bold text-white">Section 102 Ready</p>
                  <span className="text-[10px] text-cyan-300 font-medium mt-0.5 block">
                    Ordinary &amp; Special Majority
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-xl">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Live Sentiment Index
                  </span>
                  <p className="text-xl font-bold text-emerald-400">+84% Favorable</p>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                    Real-time AGM Telemetry
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-xl">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Languages className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Vernacular Reach
                  </span>
                  <p className="text-xl font-bold text-white">7 Indian Languages</p>
                  <span className="text-[10px] text-blue-300 font-medium mt-0.5 block">
                    Inclusive Retail Voting
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Unified AI Governance Suite Tabs */}
          <div className="bg-[#0b1329]/80 border border-white/10 rounded-3xl p-4 sm:p-6 md:p-8 backdrop-blur-2xl shadow-2xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <TabsList className="grid grid-cols-2 sm:grid-cols-4 bg-white/5 p-1 rounded-2xl border border-white/10 w-full sm:w-auto h-auto">
                  <TabsTrigger
                    value="summarizer"
                    className="gap-2 py-2.5 px-4 text-xs font-bold rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-300 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Risk Analyzer</span>
                  </TabsTrigger>
                  
                  <TabsTrigger
                    value="drafter"
                    className="gap-2 py-2.5 px-4 text-xs font-bold rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 transition-all"
                  >
                    <Scale className="w-4 h-4" />
                    <span>Resolution Drafter</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="sentiment"
                    className="gap-2 py-2.5 px-4 text-xs font-bold rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-300 transition-all"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Live Sentiment</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="translator"
                    className="gap-2 py-2.5 px-4 text-xs font-bold rounded-xl data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-300 transition-all"
                  >
                    <Languages className="w-4 h-4" />
                    <span>Multilingual Hub</span>
                  </TabsTrigger>
                </TabsList>

                <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AES-256 Encrypted Corporate Governance Intelligence</span>
                </div>
              </div>

              {/* Module 1: Document & AGM Risk Summarizer */}
              <TabsContent value="summarizer" className="animate-in fade-in duration-300 focus-visible:outline-none">
                <DocumentSummarizer />
              </TabsContent>

              {/* Module 2: Statutory Resolution & Explanatory Statement Drafter */}
              <TabsContent value="drafter" className="animate-in fade-in duration-300 focus-visible:outline-none">
                <ResolutionDrafter />
              </TabsContent>

              {/* Module 3: Live Meeting Sentiment Telemetry */}
              <TabsContent value="sentiment" className="animate-in fade-in duration-300 focus-visible:outline-none">
                <LiveSentimentMonitor />
              </TabsContent>

              {/* Module 4: Multilingual Shareholder Notice Hub */}
              <TabsContent value="translator" className="animate-in fade-in duration-300 focus-visible:outline-none">
                <GovernanceTranslator />
              </TabsContent>
            </Tabs>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AIPowerSuite;
