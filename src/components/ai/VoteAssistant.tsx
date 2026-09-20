import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  X, 
  Loader2, 
  Bot, 
  User, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Vote,
  FileCheck2,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { env } from '@/config/env';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  actionButton?: {
    label: string;
    url: string;
  };
}

const QUICK_PROMPTS = [
  { label: '🗳 How to Vote with OTP', prompt: 'How do I login and cast my vote using OTP on this platform?' },
  { label: '⚖ FOR / AGAINST / ABSTAIN', prompt: 'Explain the difference between voting FOR, AGAINST, and ABSTAIN on resolutions.' },
  { label: '🔐 Blockchain Receipt', prompt: 'How does the Merkle tree cryptographic voting receipt and SHA-256 hash work?' },
  { label: '🔑 Troubleshoot Login', prompt: 'I did not receive my OTP or my shareholder credentials failed. How do I troubleshoot?' },
  { label: '📜 SEBI Rule 20 Compliance', prompt: 'How does Vote India Secure comply with Section 108 of the Companies Act 2013 and SEBI LODR 44?' }
];

const LOCAL_KNOWLEDGE_BASE: Record<string, { content: string; action?: { label: string; url: string } }> = {
  'how do i login and cast my vote using otp on this platform?': {
    content: `### 🗳 Step-by-Step Shareholder E-Voting Guide:

1. **Access Shareholder Portal**: Go to the **Shareholder Login** page.
2. **Enter Credentials**: Provide your Folio / DP ID, Client ID, and Password received via email.
3. **Verify 2-Factor OTP**: Enter the 6-digit OTP dispatched to your registered mobile number and email.
4. **Review Resolutions**: Inspect ordinary and special resolutions with attached board explanatory statements.
5. **Cast Ballot**: Select **FOR**, **AGAINST**, or **ABSTAIN** for each resolution item.
6. **Submit & Seal**: Click **Submit Ballot** to record your vote to the immutable Merkle audit ledger.
7. **Download Receipt**: Instantly save your cryptographically verified confirmation receipt with SHA-256 hash.`,
    action: { label: 'Go to Shareholder Login', url: '/shareholder-login' }
  },
  'explain the difference between voting for, against, and abstain on resolutions.': {
    content: `### ⚖ Voting Option Definitions (Companies Act 2013):

- **FOR (In Favour)**: You assent and approve the proposed resolution. Your total shareholding weight is added to the affirmative tally.
- **AGAINST (Dissent)**: You reject and disapprove the resolution. Your shareholding weight is counted toward the dissenting tally.
- **ABSTAIN (Neutral)**: You formally participate in the meeting quorum, but consciously choose neither to approve nor reject the specific resolution. Abstained shares are recorded but excluded from the passing percentage calculation.

> **Note**: For an Ordinary Resolution, >50% of valid cast votes must be FOR. For a Special Resolution, at least 75% must be FOR.`
  },
  'how does the merkle tree cryptographic voting receipt and sha-256 hash work?': {
    content: `### 🔐 Cryptographic Vote Sealing & Integrity:

- **SHA-256 Hashing**: Each cast vote is cryptographically sealed into a unique 64-character hexadecimal hash \`SHA256(VoterID + ResolutionID + Choice + Nonce)\`.
- **Merkle Tree Audit Trail**: Hashes are mathematically combined into a Merkle root ledger, ensuring zero retroactive modification.
- **Audit Verification**: Independent Scrutinizers and Auditors can verify mathematical integrity without exposing individual voter identities prior to official unblocking.
- **Downloadable Receipt**: Shareholders receive a PDF receipt with verifiable QR code for permanent statutory records.`,
    action: { label: 'Explore Interactive Demo', url: '/live-demo' }
  },
  'i did not receive my otp or my shareholder credentials failed. how do i troubleshoot?': {
    content: `### 🔑 Shareholder Login & OTP Troubleshooting:

1. **Check Spam / Junk Folders**: Search for emails from \`notifications@shareholdervoting.in\`.
2. **Verify Mobile Network**: Ensure your mobile device has signal to receive SMS OTP within the 60-second window.
3. **Check Demat / Folio Details**: Ensure your DP ID & Client ID match your latest Depository Participant (NSDL/CDSL) records.
4. **RTA Contact**: If your mobile/email changed recently, contact your Registrar & Transfer Agent (RTA) to update depository records.
5. **Grievance Desk**: Reach our dedicated shareholder support team at \`support@shareholdervoting.in\`.`,
    action: { label: 'Contact Support Helpdesk', url: '/contact' }
  },
  'how does vote india secure comply with section 108 of the companies act 2013 and sebi lodr 44?': {
    content: `### 📜 Statutory Compliance Framework:

- **Section 108 & Rule 20**: Complies with the Companies (Management and Administration) Rules, 2014, including mandatory remote e-voting window (closes at 5:00 PM on preceding day).
- **SEBI LODR Regulation 44**: Full support for electronic voting facilities for all shareholder meetings of listed entities.
- **Form MGT-13 Scrutinizer Audit**: Automated unblocking with dual-custody digital keys and instant generation of official Scrutinizer Reports.
- **DPDP Act 2023 Aligned**: Strict shareholder privacy with TLS 1.3 in-transit encryption and AES-256 at-rest protection.`,
    action: { label: 'View Compliance Certifications', url: '/compliance' }
  }
};

export const VoteAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your **AI Vote Assistant**. How can I assist you with shareholder e-voting, AGM resolutions, or platform security today?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastErrorCode, setLastErrorCode] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Speech Recognition Reference
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const initializeSpeech = () => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast.info("Listening... Speak now.");
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            setInputValue(event.results[i][0].transcript);
          }
        }

        if (finalTranscript) {
          setInputValue(finalTranscript);
          handleSend(finalTranscript);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.error('Speech error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error("Microphone blocked. Please allow access in browser address bar.");
        } else if (event.error !== 'no-speech') {
          toast.error(`Microphone error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      return true;
    }
    return false;
  };

  useEffect(() => {
    initializeSpeech();
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isLoading]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        const success = initializeSpeech();
        if (!success) {
          toast.error("Voice input is not supported in this browser.");
          return;
        }
      }

      try {
        recognitionRef.current.start();
      } catch {
        try {
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current.start(), 100);
        } catch {
          toast.error("Could not activate microphone.");
        }
      }
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Remove markdown tags from speech
      const plainText = text.replace(/[*#_`>]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      const utterance = new SpeechSynthesisUtterance(plainText);
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Microsoft David")) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Message copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleResetChat = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I am your **AI Vote Assistant**. How can I assist you with shareholder e-voting, AGM resolutions, or platform security today?'
      }
    ]);
    toast.info("Conversation reset");
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || inputValue;
    if (!textToSend.trim()) return;

    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setIsLoading(true);
    setLastErrorCode(null);

    const normalizedQuery = textToSend.trim().toLowerCase();

    // Check instant local knowledge base first for ultra-fast response or fallback
    const localMatch = Object.keys(LOCAL_KNOWLEDGE_BASE).find(
      key => normalizedQuery.includes(key) || key.includes(normalizedQuery)
    );

    try {
      const { data, error } = await supabase.functions.invoke('ai-ops', {
        body: {
          action: 'chat',
          payload: {
            message: textToSend,
            context: `You are the Official AI Vote Assistant for 'Vote India Secure', a secure electronic voting platform for Indian corporate general meetings (AGMs, EGMs, Postal Ballots).

CORE KNOWLEDGE:
- **Shareholders**: Login with Folio / DP-ID and 2-Factor OTP to vote on ordinary and special resolutions.
- **Companies / RTAs**: Create voting sessions, upload depository rosters, configure resolutions, and view live quorum progression.
- **Scrutinizers**: Independent legal/audit professionals unblocking digital key tally post-meeting under Rule 20(4)(xii) with automated MGT-13 generation.
- **Security**: SHA-256 cryptographic hashing, Merkle audit trees, AES-256 encryption at rest, TLS 1.3 in transit.

RULES:
- Answer directly in structured, clear bullet points.
- Never write overly long textbook paragraphs.
- Maintain authoritative, enterprise-grade tone.`
          }
        },
        headers: {
          "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`
        }
      });

      if (error) throw error;

      const responseText = data.result;
      if (data.error_code === 'RATE_LIMIT') {
        setLastErrorCode('RATE_LIMIT');
      }

      // Determine contextual action button
      let actionBtn: { label: string; url: string } | undefined = undefined;
      const lowerResp = responseText.toLowerCase();
      if (lowerResp.includes('shareholder login') || lowerResp.includes('cast your vote')) {
        actionBtn = { label: 'Go to Shareholder Login', url: '/shareholder-login' };
      } else if (lowerResp.includes('demo') || lowerResp.includes('merkle')) {
        actionBtn = { label: 'Explore Live Demo', url: '/live-demo' };
      } else if (lowerResp.includes('compliance') || lowerResp.includes('sebi')) {
        actionBtn = { label: 'View Compliance Certifications', url: '/compliance' };
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: responseText,
          actionButton: actionBtn
        }
      ]);

      if (isSpeaking) {
        speakText(responseText);
      }

    } catch (err: unknown) {
      console.warn('AI Network/Rate Limit Hit, utilizing local knowledge base:', err);
      
      let fallbackText = "I am here to assist with shareholder voting, OTP verification, and resolution procedures.";
      let fallbackAction: { label: string; url: string } | undefined = undefined;

      if (localMatch && LOCAL_KNOWLEDGE_BASE[localMatch]) {
        fallbackText = LOCAL_KNOWLEDGE_BASE[localMatch].content;
        fallbackAction = LOCAL_KNOWLEDGE_BASE[localMatch].action;
      } else {
        fallbackText = `### 🗳 Vote India Secure Assistant Guidance:

- **Shareholder Voting**: Log in using your registered Folio ID and 2-Factor OTP to vote on active AGM/EGM resolutions.
- **Voting Options**: Cast **FOR**, **AGAINST**, or **ABSTAIN** on each resolution.
- **Audit Verification**: Every vote receives a cryptographically sealed SHA-256 confirmation receipt.
- **Support**: Reach our dedicated grievance team at \`support@shareholdervoting.in\`.`;
        fallbackAction = { label: 'Open Shareholder Portal', url: '/shareholder-login' };
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: fallbackText,
          actionButton: fallbackAction
        }
      ]);

      if (isSpeaking) {
        speakText(fallbackText);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Vote Assistant"
          className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-600 via-cyan-500 to-teal-400 hover:scale-105 text-white shadow-2xl shadow-blue-900/50 hover:shadow-cyan-500/50 transition-all duration-300 backdrop-blur-md border border-white/20 relative group"
        >
          <Bot className="h-7 w-7 text-white animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#020817]"></span>
          </span>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-24px)] sm:w-[400px] h-[580px] max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-6 fade-in duration-300 rounded-3xl border border-white/15 overflow-hidden backdrop-blur-2xl bg-[#091124]/95 text-white">
          
          {/* Glass Header */}
          <div className="bg-white/5 backdrop-blur-md px-4 py-3 flex flex-row items-center justify-between shrink-0 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-white text-sm">Vote Assistant</h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                    AI v2.5
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <p className="text-[11px] text-slate-300 font-medium">Online · Ready to assist</p>
                </div>
              </div>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                onClick={handleResetChat}
                title="Reset Conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-full transition-colors",
                  isSpeaking ? "text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20" : "text-slate-400 hover:text-white hover:bg-white/10"
                )}
                onClick={() => {
                  const newState = !isSpeaking;
                  setIsSpeaking(newState);
                  if (!newState && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  }
                  toast.info(newState ? "Voice Readout Enabled" : "Voice Readout Muted");
                }}
                title={isSpeaking ? "Mute Voice Readout" : "Enable Voice Readout"}
              >
                {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                onClick={() => {
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  }
                  setIsOpen(false);
                }}
                title="Close Assistant"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Prompts Carousel (Shown at Start) */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-black/20 border-b border-white/5 overflow-x-auto scrollbar-none flex gap-1.5 shrink-0">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(qp.prompt)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:bg-white/10 text-slate-300 hover:text-white whitespace-nowrap transition-all flex items-center gap-1"
                >
                  <span>{qp.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Chat Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            ref={scrollRef}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex w-full items-end gap-2.5",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                {msg.role !== 'user' && (
                  <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shrink-0 mb-1 shadow-md">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[86%] px-4 py-3 text-xs sm:text-sm shadow-md backdrop-blur-md overflow-hidden relative group",
                    msg.role === 'user'
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl rounded-tr-sm font-medium"
                      : "bg-white/[0.07] text-slate-100 rounded-2xl rounded-tl-sm border border-white/10"
                  )}
                >
                  <div className="prose prose-invert prose-xs sm:prose-sm max-w-none break-words leading-relaxed font-light space-y-2">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  {/* Contextual Action Button */}
                  {msg.actionButton && (
                    <div className="mt-3 pt-2.5 border-t border-white/10">
                      <Link
                        to={msg.actionButton.url}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-all hover:scale-[1.02]"
                      >
                        <span>{msg.actionButton.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}

                  {/* Copy message button */}
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleCopyMessage(msg.content, idx)}
                      className="absolute top-2 right-2 p-1 rounded-md bg-black/40 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy response"
                    >
                      {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex w-full items-end gap-2.5 flex-row">
                <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shrink-0 mb-1">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md border border-white/10 backdrop-blur-md">
                  <div className="flex gap-1.5 items-center">
                    <span className="text-xs text-slate-300 mr-1.5">Generating answer</span>
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Listening Visual Waveform */}
          {isListening && (
            <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/30 flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="text-xs font-semibold text-red-300">Listening to microphone... Speak clearly</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleListening}
                className="h-6 text-[10px] text-red-300 hover:bg-red-500/20 px-2 rounded-md"
              >
                Stop
              </Button>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-white/5 border-t border-white/10 mt-auto backdrop-blur-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center"
            >
              <div className="absolute left-2 flex items-center z-10">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "h-8 w-8 rounded-full transition-colors",
                    isListening ? "text-red-400 bg-red-500/20 animate-pulse" : "text-slate-400 hover:text-white hover:bg-white/10"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleListening();
                  }}
                  title="Voice Input (Speech-to-Text)"
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>

              <Input
                placeholder={isListening ? "Listening to your voice..." : "Ask AI about voting, resolutions..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full pl-11 pr-11 h-11 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 text-xs sm:text-sm backdrop-blur-sm shadow-inner"
              />

              <div className="absolute right-2 flex items-center">
                <Button
                  type="submit"
                  size="icon"
                  className="h-7 w-7 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-md transition-transform active:scale-95"
                  disabled={isLoading || (!inputValue.trim() && !isListening)}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </form>
          </div>

        </div>
      )}
    </div>
  );
};

export default VoteAssistant;
