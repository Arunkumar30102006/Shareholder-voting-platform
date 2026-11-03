import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, Sparkles, Copy, Check, Loader2, ArrowRight, BookOpen, Globe2, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { env } from '@/config/env';
import ReactMarkdown from 'react-markdown';
const LANGUAGES = [
    { code: 'hi', name: 'Hindi (हिन्दी)', sampleLabel: 'हिन्दी में अनुवाद' },
    { code: 'mr', name: 'Marathi (मराठी)', sampleLabel: 'मराठीत भाषांतर' },
    { code: 'ta', name: 'Tamil (தமிழ்)', sampleLabel: 'தமிழில் மொழிபெயர்ப்பு' },
    { code: 'te', name: 'Telugu (తెలుగు)', sampleLabel: 'తెలుగులో అనువాదం' },
    { code: 'gu', name: 'Gujarati (ગુજરાતી)', sampleLabel: 'ગુજરાતીમાં અનુવાદ' },
    { code: 'bn', name: 'Bengali (বাংলা)', sampleLabel: 'বাংলায় অনুবাদ' },
    { code: 'en', name: 'Simplified Plain English', sampleLabel: 'Plain English Summary' }
];
const PRESETS = [
    {
        title: 'Resolution 1: Appointment of Auditor & Remuneration',
        text: 'To consider and approve the appointment of M/s BSR & Co. LLP, Chartered Accountants (Firm Registration No. 101248W/W-100022), as Statutory Auditors of the Company for a term of five consecutive years from the conclusion of the 32nd Annual General Meeting until the conclusion of the 37th Annual General Meeting at an annual remuneration of ₹45 Lakhs plus out-of-pocket expenses.'
    },
    {
        title: 'Resolution 2: Dividend Declaration of ₹15 per Share',
        text: 'To declare a final dividend of ₹15 per equity share of face value ₹10 each for the financial year ended March 31, 2026. The dividend, if declared at the AGM, will be paid within 30 days to those members whose names appear on the Register of Members as on the Record Date August 14, 2026.'
    },
    {
        title: 'Resolution 3: Approval of ESOP Scheme 2026',
        text: 'To approve Employee Stock Option Plan (ESOP 2026) authorizing the Board of Directors / Nomination and Remuneration Committee to create, grant, offer and issue up to 5,00,000 equity-settled options to eligible employees of the Company and its subsidiary companies at an exercise price equal to market price on the date of grant.'
    }
];
export const GovernanceTranslator = () => {
    const [targetLang, setTargetLang] = useState('hi');
    const [inputText, setInputText] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [translatedOutput, setTranslatedOutput] = useState('');
    const [copied, setCopied] = useState(false);
    const selectedLangObj = LANGUAGES.find((l) => l.code === targetLang) || LANGUAGES[0];
    const handleTranslate = async () => {
        if (!inputText.trim()) {
            toast.error('Please enter resolution or notice text to translate');
            return;
        }
        setIsTranslating(true);
        setTranslatedOutput('');
        const translationPrompt = `You are a Multilingual Corporate Governance Specialist for Indian shareholder general meetings.

Translate and simplify the following legal/corporate resolution text into ${selectedLangObj.name}.

OUTPUT INSTRUCTIONS:
1. Translate accurately into native, grammatically clean ${selectedLangObj.name}.
2. Use simple, everyday language so retail investors and senior citizen shareholders can understand without legal jargon.
3. Structure the output into:
   - 📌 **मुख्य सारांश (Key Summary)**: 2 concise bullet points.
   - 🗳 **शेयरधारकों के लिए इसका क्या अर्थ है (What it means for Shareholders)**: Plain language explanation of what they are voting FOR or AGAINST.
   - 💰 **वित्तीय या नियंत्रण प्रभाव (Financial or Governance Impact)**: Clear breakdown of rupees, shares, or director appointments.
   - ⚖ **मतदान आवश्यकता (Voting Threshold)**: Simple explanation of whether it is an Ordinary or Special Resolution.

RESOLUTION TEXT TO TRANSLATE:
${inputText}`;
        try {
            const { data, error } = await supabase.functions.invoke('ai-ops', {
                body: {
                    action: 'summarize',
                    payload: { text: translationPrompt }
                },
                headers: {
                    "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`
                }
            });
            if (error)
                throw error;
            setTranslatedOutput(data.result);
            toast.success(`Translated into ${selectedLangObj.name}!`);
        }
        catch (err) {
            console.error('Translation error:', err);
            toast.error('Failed to translate. Please try again.');
        }
        finally {
            setIsTranslating(false);
        }
    };
    const handleCopy = () => {
        if (!translatedOutput)
            return;
        navigator.clipboard.writeText(translatedOutput);
        setCopied(true);
        toast.success('Translation copied to clipboard!');
        setTimeout(() => setCopied(false), 2500);
    };
    return (<div className="space-y-6">
      {/* Language Selector Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Languages className="w-5 h-5 text-cyan-400"/>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Multilingual Shareholder Notice Hub</h3>
            <p className="text-xs text-slate-400">Democratize AGM participation across Indian vernacular languages.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label className="text-xs text-slate-300 whitespace-nowrap">Target Language:</Label>
          <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger className="w-full sm:w-[220px] bg-[#0d1b2a] border-white/15 text-white text-xs">
              <SelectValue placeholder="Select Language"/>
            </SelectTrigger>
            <SelectContent className="bg-[#0d1b2a] border-white/15 text-white">
              {LANGUAGES.map((l) => (<SelectItem key={l.code} value={l.code} className="text-xs">
                  {l.name}
                </SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-blue-400"/> Sample Resolutions (Click to Load)
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESETS.map((p, idx) => (<button key={idx} type="button" onClick={() => {
                setInputText(p.text);
                toast.info(`Loaded "${p.title}"`);
            }} className="p-3 text-left rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:bg-white/10 transition-all text-xs group">
              <div className="font-bold text-white group-hover:text-cyan-300 mb-1">{p.title}</div>
              <div className="text-slate-400 line-clamp-2 leading-relaxed font-normal">{p.text}</div>
            </button>))}
        </div>
      </div>

      {/* Input Textarea & Action */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-blue-400"/>
            Legal Notice / Resolution Input Text
          </CardTitle>
          <CardDescription className="text-xs text-slate-300">
            Paste AGM meeting notice agenda, director qualifications, or scheme of merger details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea placeholder="Paste statutory resolution text in English..." value={inputText} onChange={(e) => setInputText(e.target.value)} className="bg-white/5 border-white/10 text-white min-h-[130px] text-sm resize-none"/>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400"/>
              <span>Converts complex legal terms into plain language bullets for retail shareholders.</span>
            </div>

            <Button onClick={handleTranslate} disabled={isTranslating || !inputText.trim()} className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold gap-2 px-6 py-5 rounded-xl shadow-lg shadow-cyan-900/30">
              {isTranslating ? (<>
                  <Loader2 className="w-4 h-4 animate-spin"/>
                  Translating to {selectedLangObj.name}...
                </>) : (<>
                  <Sparkles className="w-4 h-4"/>
                  Generate {selectedLangObj.name} Briefing
                  <ArrowRight className="w-4 h-4 ml-1"/>
                </>)}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Translated Result */}
      {translatedOutput && (<Card className="bg-[#0d1b2a]/90 border-cyan-500/30 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/10">
            <div>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Languages className="w-4 h-4 text-cyan-400"/>
                {selectedLangObj.name} Shareholder Briefing
              </CardTitle>
              <CardDescription className="text-xs text-slate-300">
                Ready to embed in shareholder email/SMS dispatch or shareholder portal.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy} className="border-white/20 text-white hover:bg-white/10 gap-1.5">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400"/> : <Copy className="w-3.5 h-3.5"/>}
              {copied ? 'Copied' : 'Copy Briefing'}
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed font-light space-y-4">
              <ReactMarkdown>{translatedOutput}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>)}
    </div>);
};
export default GovernanceTranslator;
