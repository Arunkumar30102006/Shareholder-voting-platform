import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { env } from '@/config/env';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, FileUp, X, CheckCircle2, Copy, Check, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
const SAMPLE_DOCS = [
    {
        title: '32nd AGM Notice & Special Resolutions',
        category: 'AGM Notice',
        text: `NOTICE OF THE 32ND ANNUAL GENERAL MEETING
NOTICE IS HEREBY GIVEN that the 32nd Annual General Meeting (AGM) of the Members of INFRA TECH INDIA LIMITED will be held on Friday, September 18, 2026 at 11:00 A.M. (IST) via Video Conferencing (VC) / Other Audio-Visual Means (OAVM).

ORDINARY BUSINESS:
1. Adoption of Audited Financial Statements: To receive, consider and adopt the Audited Standalone and Consolidated Financial Statements of the Company for the Financial Year ended March 31, 2026, together with the Reports of the Board of Directors and Auditors thereon.
2. Declaration of Final Dividend: To declare a final dividend of ₹12.50 per equity share of face value ₹10 each for the FY 2025-26.
3. Re-appointment of Director: To appoint a Director in place of Mr. Rajesh Verma (DIN: 00124890), who retires by rotation and being eligible, offers himself for re-appointment.

SPECIAL BUSINESS:
4. Special Resolution - Approval for Qualified Institutional Placement (QIP):
RESOLVED THAT pursuant to the provisions of Section 42, 62(1)(c) and other applicable provisions of the Companies Act, 2013 and SEBI (ICDR) Regulations, the consent of the Company be and is hereby accorded to raise up to ₹3,500 Crores via issuance of equity shares to Qualified Institutional Buyers.
5. Special Resolution - Material Related Party Transactions with Infra Power Grid Private Limited for EPC contract of ₹1,800 Crores under SEBI LODR Regulation 23.`
    },
    {
        title: 'Scheme of Amalgamation & Demerger',
        category: 'M&A Restructuring',
        text: `EXPLANATORY STATEMENT UNDER SECTION 230-232 OF THE COMPANIES ACT 2013
IN THE MATTER OF THE SCHEME OF ARRANGEMENT AND DEMERGER BETWEEN:
TITAN ADVANCED MATERIALS LIMITED (Demerged Company) AND TITAN CLEAN ENERGY TECHNOLOGIES LIMITED (Resulting Company)

1. RATIONALE OF THE SCHEME:
- Unlocking shareholder value by creating a dedicated pure-play green energy enterprise.
- Independent capital allocation and direct access to global ESG capital markets.
- Streamlining management bandwidth and corporate operational synergies.

2. SHARE ENTITLEMENT RATIO:
- For every 10 (Ten) equity shares of face value ₹10 each held in Demerged Company, shareholders will receive 4 (Four) fully paid-up equity shares of face value ₹10 each in Resulting Company.

3. FINANCIAL & TAX IMPLICATIONS:
- Compliant with Section 2(19AA) of the Income-tax Act, 1961. No immediate capital gains tax liability for existing shareholders.
- Total net worth of ₹8,400 Crores allocated pro-rata based on book values as of Valuation Date March 31, 2026.`
    },
    {
        title: 'Executive Remuneration & ESOP 2026 Scheme',
        category: 'Governance & ESOP',
        text: `SPECIAL RESOLUTION - APPROVAL OF ESOP 2026 SCHEME & PERFORMANCE INCENTIVE PLAN
To consider and approve the 'Apex Innovations Employee Stock Option Plan 2026 (ESOP 2026)' for grant of up to 10,00,000 equity options to permanent employees, Managing Director, and Whole-time Directors.

KEY TERMS:
1. Total Pool: 10,00,000 options representing 1.8% of the paid-up equity share capital.
2. Vesting Period: Graded vesting over 4 years (25% each year), subject to minimum 15% Annual EBITDA growth.
3. Exercise Price: Market price on the date of grant or a discount of up to 10% as determined by the Nomination and Remuneration Committee.
4. Independent Directors Exclusion: In compliance with Section 149(9) of Companies Act 2013, Independent Directors shall not be entitled to any stock options.`
    }
];
export const DocumentSummarizer = () => {
    const [text, setText] = useState('');
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [activeFile, setActiveFile] = useState(null);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef(null);
    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        const MAX_FILE_SIZE_MB = 10;
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            toast.error(`File is too large. Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`);
            if (fileInputRef.current)
                fileInputRef.current.value = '';
            return;
        }
        setActiveFile(file);
        setIsExtracting(true);
        setSummary('');
        try {
            let extractedText = '';
            const fileType = file.type;
            if (fileType === 'application/pdf') {
                extractedText = await extractTextFromPDF(file);
            }
            else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                extractedText = await extractTextFromWord(file);
            }
            else if (fileType.startsWith('image/')) {
                extractedText = await extractTextFromImage(file);
            }
            else {
                toast.error(`Unsupported file type: ${fileType}. Please upload PDF, Word, or Image.`);
                setActiveFile(null);
                setIsExtracting(false);
                return;
            }
            if (extractedText && extractedText.trim()) {
                setText(extractedText);
                toast.success('Text extracted successfully!');
                handleSummarize(extractedText);
            }
            else {
                toast.error('No readable text found in this file.');
            }
        }
        catch (error) {
            console.error('Extraction Error Details:', error);
            const errorMessage = error?.message || 'Check if the file is encrypted or corrupted.';
            toast.error(`Failed to extract text: ${errorMessage}`);
        }
        finally {
            setIsExtracting(false);
        }
    };
    const extractTextFromPDF = async (file) => {
        try {
            const pdfjs = await import('pdfjs-dist');
            if (!pdfjs.GlobalWorkerOptions.workerSrc) {
                pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
            }
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const pageText = content.items
                    .map((item) => item.str || '')
                    .filter((str) => str.trim().length > 0)
                    .join(' ');
                fullText += pageText + '\n';
            }
            return fullText;
        }
        catch (err) {
            console.error('PDF.js Error:', err);
            throw new Error(`PDF Error: ${err.message || 'Worker initialization failed'}`);
        }
    };
    const extractTextFromWord = async (file) => {
        const mammoth = (await import('mammoth')).default;
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    };
    const extractTextFromImage = async (file) => {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng');
        const ret = await worker.recognize(file);
        await worker.terminate();
        return ret.data.text;
    };
    const handleSummarize = async (overrideText) => {
        const textToSummarize = overrideText || text;
        if (!textToSummarize.trim()) {
            toast.error('Please enter text or select a statutory document preset');
            return;
        }
        setIsLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('ai-ops', {
                body: { action: 'summarize', payload: { text: textToSummarize } },
                headers: {
                    "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`
                }
            });
            if (error)
                throw error;
            setSummary(data.result);
            toast.success('Document analysis & risk assessment generated!');
        }
        catch (error) {
            console.error('Error generating summary:', error);
            toast.error('Failed to generate summary. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const loadPreset = (preset) => {
        setText(preset.text);
        setActiveFile(null);
        toast.info(`Loaded sample: "${preset.title}"`);
        handleSummarize(preset.text);
    };
    const clearFile = () => {
        setActiveFile(null);
        setText('');
        setSummary('');
        if (fileInputRef.current)
            fileInputRef.current.value = '';
    };
    const handleCopy = () => {
        if (!summary)
            return;
        navigator.clipboard.writeText(summary);
        setCopied(true);
        toast.success('Analysis copied to clipboard!');
        setTimeout(() => setCopied(false), 2500);
    };
    return (<div className="space-y-6">
      {/* 1-Click Sample AGM Documents */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-400"/>
            1-Click Sample AGM &amp; Governance Documents
          </span>
          <span className="text-[11px] text-slate-400">Instant evaluation presets</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_DOCS.map((doc, idx) => (<button key={idx} type="button" onClick={() => loadPreset(doc)} className="p-3 text-left rounded-xl bg-white/5 border border-white/10 hover:border-purple-400/40 hover:bg-white/10 transition-all text-xs group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                    {doc.title}
                  </span>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-purple-400/30 text-purple-300 bg-purple-500/10">
                    {doc.category}
                  </Badge>
                </div>
                <p className="text-slate-400 line-clamp-2 leading-relaxed font-normal">
                  {doc.text.slice(0, 150)}...
                </p>
              </div>
              <span className="text-[10px] text-cyan-400 font-semibold mt-2 group-hover:underline">Click to Analyze →</span>
            </button>))}
        </div>
      </div>

      {/* Main Summarizer Card */}
      <Card className="w-full backdrop-blur-xl bg-white/5 border-white/10 shadow-2xl overflow-hidden">
        <CardHeader className="text-center pb-2">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
            <Sparkles className="h-7 w-7 text-purple-400 animate-pulse"/>
            AI Document &amp; AGM Risk Analyzer
          </CardTitle>
          <CardDescription className="text-slate-300 text-sm">
            Analyze 50+ page annual reports, meeting notices, or proxy statements into structured governance risk breakdowns in seconds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">

          {/* File Upload Area */}
          <div className={`relative border-2 border-dashed rounded-2xl p-6 md:p-8 transition-all duration-300 group ${activeFile ? 'border-primary/50 bg-primary/5' : 'border-white/15 hover:border-purple-500/50 hover:bg-white/5'}`}>
            <input type="file" ref={fileInputRef} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".pdf,.docx,image/*" onChange={handleFileChange} disabled={isExtracting || isLoading}/>

            <div className="flex flex-col items-center justify-center text-center space-y-3">
              {activeFile ? (<>
                  <div className="p-3.5 rounded-full bg-primary/20 text-primary animate-in zoom-in duration-300">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400"/>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">{activeFile.name}</p>
                    <p className="text-xs text-slate-400">
                      {(activeFile.size / 1024 / 1024).toFixed(2)} MB • {activeFile.type.split('/')[1]?.toUpperCase() || 'DOCUMENT'}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="z-20 text-red-400 hover:bg-red-500/10 text-xs" onClick={(e) => {
                e.stopPropagation();
                clearFile();
            }}>
                    <X className="h-3.5 w-3.5 mr-1"/> Remove File
                  </Button>
                </>) : (<>
                  <div className="p-3.5 rounded-2xl bg-white/5 text-slate-400 group-hover:bg-purple-500/10 group-hover:text-purple-400 transition-colors duration-300">
                    <FileUp className="h-8 w-8"/>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm md:text-base font-semibold text-white">
                      Click or Drag &amp; Drop AGM Documents
                    </p>
                    <p className="text-xs text-slate-400">Supports PDF, Word (.docx), and Scanned Image OCR up to 10MB</p>
                  </div>
                </>)}
            </div>

            {isExtracting && (<div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-30">
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="h-7 w-7 text-cyan-400 animate-spin"/>
                  <p className="text-xs font-medium animate-pulse text-white">Extracting text &amp; tables...</p>
                </div>
              </div>)}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#020817] px-3 text-slate-400 font-semibold tracking-wider">OR PASTE NOTICE TEXT</span>
            </div>
          </div>

          <div className="space-y-2">
            <Textarea placeholder="Paste text from your annual report, meeting notice agenda, or statutory resolutions here..." className="min-h-[140px] bg-white/5 border-white/10 text-white focus-visible:ring-purple-500 rounded-xl text-sm" value={text} onChange={(e) => setText(e.target.value)}/>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex gap-4 text-xs text-slate-300">
              <div>
                <span className="text-slate-400">Words:</span>{' '}
                <span className="font-mono text-white font-semibold">{text.trim() ? text.trim().split(/\s+/).length : 0}</span>
              </div>
              <div>
                <span className="text-slate-400">Size:</span>{' '}
                <span className="font-mono text-white font-semibold">{new Blob([text]).size} bytes</span>
              </div>
            </div>

            <Button onClick={() => handleSummarize()} disabled={isLoading || isExtracting || !text.trim()} className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold px-8 py-5 rounded-xl shadow-lg shadow-purple-900/30 transition-all">
              {isLoading ? (<>
                  <Loader2 className="mr-2.5 h-4 w-4 animate-spin"/>
                  Generating Statutory Risk Breakdown...
                </>) : (<>
                  <Sparkles className="mr-2.5 h-4 w-4 animate-pulse"/>
                  <span>Analyze &amp; Summarize Document</span>
                </>)}
            </Button>
          </div>

          {summary && (<div className="mt-8 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-transparent border border-purple-500/30 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Sparkles className="h-5 w-5"/>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Statutory Governance Risk Breakdown</h3>
                    <p className="text-xs text-slate-400">Generated under Companies Act 2013 &amp; SEBI LODR Standards</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 text-xs gap-1.5" onClick={handleCopy}>
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400"/> : <Copy className="w-3.5 h-3.5"/>}
                    {copied ? 'Copied' : 'Copy Summary'}
                  </Button>
                </div>
              </div>

              <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed font-light space-y-4">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            </div>)}
        </CardContent>
      </Card>
    </div>);
};
export default DocumentSummarizer;
