import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Scale, ShieldCheck, Copy, Check, Loader2, ArrowRight, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { env } from '@/config/env';
import ReactMarkdown from 'react-markdown';
const TEMPLATES = [
    {
        id: 'director-appointment',
        title: 'Appointment of Independent Director',
        category: 'Ordinary',
        companyName: 'Tata Consultancy Services Ltd / Infosys Ltd',
        objective: 'Appoint Dr. Anita Sharma (DIN: 08941235) as an Independent Director for a 5-year term under Section 149 of the Companies Act 2013.',
        details: 'Dr. Sharma brings over 25 years of cybersecurity and fintech leadership. Meets all independence criteria under Section 149(6) and SEBI LODR Regulation 16(1)(b).'
    },
    {
        id: 'dividend-approval',
        title: 'Declaration of Final Dividend (₹18 per share)',
        category: 'Ordinary',
        companyName: 'Reliance Industries Ltd / HDFC Bank Ltd',
        objective: 'Approve final dividend of ₹18 (180%) per equity share of face value ₹10 each for the Financial Year 2025-26.',
        details: 'Total cash payout of ₹4,250 Crores to eligible shareholders as on the record date, compliant with Section 123 of the Companies Act 2013 and Dividend Distribution Policy.'
    },
    {
        id: 'capital-increase',
        title: 'Increase in Authorized Share Capital',
        category: 'Special',
        companyName: 'Bharat Electronics Corp Ltd',
        objective: 'Increase authorized share capital from ₹500 Cr to ₹1,000 Cr and alter Clause V of the Memorandum of Association.',
        details: 'Required to support aggressive green hydrogen capex and future rights issue expansion. Requires 75% Special Majority under Section 13 and Section 61.'
    },
    {
        id: 'related-party',
        title: 'Material Related Party Transaction Approval',
        category: 'Ordinary',
        companyName: 'Adani Enterprises Ltd / Larsen & Toubro Ltd',
        objective: 'Approve supply of raw materials and logistics services with Subsidiary Entity exceeding ₹1,000 Cr under SEBI LODR Regulation 23.',
        details: 'Transaction is at arm\'s length basis in ordinary course of business. Related parties will abstain from voting as mandated by SEBI regulations.'
    },
    {
        id: 'bonus-issue',
        title: 'Issuance of Bonus Equity Shares (1:1 Ratio)',
        category: 'Special',
        companyName: 'Wipro Ltd / Sun Pharma Ltd',
        objective: 'Capitalize ₹2,500 Cr from Free Reserves / Securities Premium to issue 1 Bonus Equity Share for every 1 existing share held.',
        details: 'Compliant with Section 63 of Companies Act 2013 and SEBI (ICDR) Regulations. Enhances stock liquidity and broadens retail investor participation.'
    }
];
export const ResolutionDrafter = () => {
    const [resolutionType, setResolutionType] = useState('Ordinary');
    const [title, setTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [objective, setObjective] = useState('');
    const [details, setDetails] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedDraft, setGeneratedDraft] = useState('');
    const [copied, setCopied] = useState(false);
    const applyTemplate = (tpl) => {
        setTitle(tpl.title);
        setResolutionType(tpl.category);
        setCompanyName(tpl.companyName);
        setObjective(tpl.objective);
        setDetails(tpl.details);
        toast.info(`Loaded "${tpl.title}" template`);
    };
    const handleGenerate = async () => {
        if (!title.trim() || !objective.trim()) {
            toast.error('Please enter the Resolution Title and Core Objective');
            return;
        }
        setIsGenerating(true);
        setGeneratedDraft('');
        const draftingPrompt = `You are a Senior Corporate Secretarial and Legal Governance Counsel specialized in Indian Corporate Law (Companies Act 2013, Rule 20 of Companies (Management and Administration) Rules 2014, and SEBI LODR Regulations 2015).

DRAFT A COMPLETE, FORMAL STATUTORY RESOLUTION PACKAGE:

Company / Issuer: ${companyName || 'Public Listed Enterprise'}
Resolution Title: ${title}
Resolution Category: ${resolutionType} Resolution (Requires ${resolutionType === 'Special' ? '75% Special Majority' : 'Simple Majority >50%'})
Core Objective: ${objective}
Key Background & Terms: ${details || 'Standard statutory compliance parameters'}

OUTPUT FORMAT (STRICT MARKDOWN STRUCTURE):

### 1. 📜 FORMAL RESOLUTION TEXT
- Write the exact statutory resolution text starting with:
  "RESOLVED THAT pursuant to the provisions of Section [Applicable Section] and other applicable provisions, if any, of the Companies Act, 2013..."
- Include clear operational authority clauses for Company Secretary and Board of Directors.

### 2. 📑 EXPLANATORY STATEMENT (SECTION 102 OF COMPANIES ACT 2013)
- Background, context, and commercial rationale
- Specific disclosures required by statute (financial interest of Directors, KMP, and relatives)
- Justification of why passing this resolution is in the best interest of the Company and minority shareholders.

### 3. ⚖ STATUTORY VOTING & SCRUTINIZER CRITERIA
- Required Majority: ${resolutionType === 'Special' ? 'Special Resolution (Three-fourth majority / 75%)' : 'Ordinary Resolution (Simple majority / >50%)'}
- E-Voting Rule: Rule 20 of Companies (Management & Administration) Rules 2014
- Voting Exclusions / Interested Party Abstentions (if applicable under SEBI LODR 23)
- Scrutinizer Audit & Unblocking protocol under Rule 20(4)(xii)

### 4. 🔍 BOARDROOM COMPLIANCE CHECKLIST
- 3 key statutory filing requirements (e.g. Form MGT-14 within 30 days for Special Resolutions, Stock Exchange intimation within 24 hours).

Keep the language rigorous, professional, and directly ready for inclusion in AGM/EGM Notices.`;
        try {
            const { data, error } = await supabase.functions.invoke('ai-ops', {
                body: {
                    action: 'summarize',
                    payload: { text: draftingPrompt }
                },
                headers: {
                    "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`
                }
            });
            if (error)
                throw error;
            setGeneratedDraft(data.result);
            toast.success('Statutory Resolution Draft generated successfully!');
        }
        catch (err) {
            console.error('Drafting Error:', err);
            toast.error('Failed to generate draft. Please try again.');
        }
        finally {
            setIsGenerating(false);
        }
    };
    const handleCopy = () => {
        if (!generatedDraft)
            return;
        navigator.clipboard.writeText(generatedDraft);
        setCopied(true);
        toast.success('Resolution draft copied to clipboard!');
        setTimeout(() => setCopied(false), 2500);
    };
    return (<div className="space-y-6">
      {/* Quick Template Presets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-400"/>
            Statutory AGM &amp; EGM Presets
          </Label>
          <span className="text-[11px] text-slate-400">Click a template to auto-populate</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {TEMPLATES.map((tpl) => (<button key={tpl.id} type="button" onClick={() => applyTemplate(tpl)} className="text-left p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-400/40 hover:bg-white/10 transition-all duration-200 group flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                  {tpl.title}
                </span>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${tpl.category === 'Special'
                ? 'border-purple-400/40 text-purple-300 bg-purple-500/10'
                : 'border-blue-400/40 text-blue-300 bg-blue-500/10'}`}>
                  {tpl.category}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-normal">
                {tpl.objective}
              </p>
            </button>))}
        </div>
      </div>

      {/* Drafting Input Form */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-cyan-400"/>
            Statutory Resolution Drafting Engine
          </CardTitle>
          <CardDescription className="text-slate-300 text-xs">
            Generate Section 102 Explanatory Statements and compliant resolution wording under the Companies Act 2013.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Resolution Category</Label>
              <Select value={resolutionType} onValueChange={(val) => setResolutionType(val)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select type"/>
                </SelectTrigger>
                <SelectContent className="bg-[#0d1b2a] border-white/10 text-white">
                  <SelectItem value="Ordinary">Ordinary Resolution (&gt;50% Majority)</SelectItem>
                  <SelectItem value="Special">Special Resolution (75% Majority)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs text-slate-300">Company / Enterprise Name</Label>
              <Input placeholder="e.g. Acme Industries Ltd (CIN: L12345MH2020PLC000000)" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="bg-white/5 border-white/10 text-white"/>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300">Resolution Title / Headline</Label>
            <Input placeholder="e.g. Approval for Alteration of Articles of Association under Section 14" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-white/5 border-white/10 text-white font-medium"/>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300">Core Objective &amp; Statutory Authority</Label>
            <Textarea placeholder="Describe what the Board seeks shareholder approval for, including proposed amendments, capital amounts, or nominee details..." value={objective} onChange={(e) => setObjective(e.target.value)} className="bg-white/5 border-white/10 text-white min-h-[90px] resize-none"/>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300">Background, Commercial Rationale &amp; Director Interests</Label>
            <Textarea placeholder="Provide background context for the Section 102 Explanatory Statement (e.g. commercial necessity, promoter/director shareholding, independent valuation details)..." value={details} onChange={(e) => setDetails(e.target.value)} className="bg-white/5 border-white/10 text-white min-h-[80px] resize-none"/>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleGenerate} disabled={isGenerating || !title.trim() || !objective.trim()} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold gap-2 px-6 py-5 rounded-xl shadow-lg shadow-blue-900/30">
              {isGenerating ? (<>
                  <Loader2 className="w-4 h-4 animate-spin"/>
                  Generating Statutory Package...
                </>) : (<>
                  <Sparkles className="w-4 h-4"/>
                  Draft Compliant Resolution &amp; Section 102 Statement
                  <ArrowRight className="w-4 h-4 ml-1"/>
                </>)}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Output */}
      {generatedDraft && (<Card className="bg-[#0d1b2a]/90 border-cyan-500/30 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/10">
            <div>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400"/>
                Generated Statutory Resolution &amp; Explanatory Statement
              </CardTitle>
              <CardDescription className="text-xs text-slate-300">
                Ready for inclusion in Annual Report Notice and Scrutinizer Audit Ledger.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy} className="border-white/20 text-white hover:bg-white/10 gap-1.5">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400"/> : <Copy className="w-3.5 h-3.5"/>}
              {copied ? 'Copied' : 'Copy Package'}
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed font-light space-y-4">
              <ReactMarkdown>{generatedDraft}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>)}
    </div>);
};
export default ResolutionDrafter;
