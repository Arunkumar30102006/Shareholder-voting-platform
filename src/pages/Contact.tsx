import { SEO } from "@/components/layout/SEO";
import { createBreadcrumbSchema, createFaqSchema } from "@/components/layout/StructuredData";
import { 
  Mail, MapPin, Clock, Globe, Shield, Building2, Send, 
  Loader2, ArrowRight, FileCheck2, HelpCircle, Headphones, 
  Users, Briefcase, AlertTriangle, Wrench, Handshake, MessageCircle,
  ChevronDown, CheckCircle2, Copy, Check, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { env } from "@/config/env";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { TurnstileWidget, TurnstileWidgetRef } from "@/components/common/TurnstileWidget";

// JSON-LD Structured Data for Contact Page
const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Vote India Secure",
  "description": "Get in touch with Vote India Secure for shareholder support, corporate e-voting deployments, technical help, complaints, or general inquiries.",
  "url": "https://www.shareholdervoting.in/contact",
  "mainEntity": {
    "@type": "Organization",
    "name": "Vote India Secure",
    "url": "https://www.shareholdervoting.in",
    "logo": "https://www.shareholdervoting.in/logo.png",
    "email": ["support@shareholdervoting.in", "admin@shareholdervoting.in"],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "support@shareholdervoting.in",
        "availableLanguage": ["English", "Hindi"]
      },
      {
        "@type": "ContactPoint",
        "contactType": "sales",
        "email": "admin@shareholdervoting.in",
        "availableLanguage": ["English", "Hindi"]
      }
    ]
  }
};

const breadcrumbSchema = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Contact Us", url: "/contact" }
]);

const inquiryTypes = [
  { value: "general", label: "General Inquiry", icon: MessageCircle, description: "Any general questions about our platform" },
  { value: "corporate-sales", label: "Corporate Sales", icon: Briefcase, description: "AGM/EGM deployment, pricing & proposals" },
  { value: "shareholder-support", label: "Shareholder Support", icon: Users, description: "Help with voting, login, or OTP issues" },
  { value: "technical-issue", label: "Technical Issue", icon: Wrench, description: "Report a bug or technical problem" },
  { value: "complaint", label: "Complaint / Grievance", icon: AlertTriangle, description: "File a formal complaint or grievance" },
  { value: "partnership", label: "Partnership", icon: Handshake, description: "Business collaboration & integration" },
];

const quickActions = [
  {
    icon: Headphones,
    title: "Schedule a Demo",
    description: "See our platform in action with a live walkthrough tailored to your company.",
    link: "/demo",
    color: "blue"
  },
  {
    icon: FileCheck2,
    title: "SEBI Compliance",
    description: "Review our regulatory compliance documentation and certifications.",
    link: "/compliance",
    color: "cyan"
  },
  {
    icon: HelpCircle,
    title: "Knowledge Base",
    description: "Browse FAQs, guides, and step-by-step help for common queries.",
    link: "/services",
    color: "indigo"
  }
];

const contactFaqs = [
  {
    q: "How can companies request a demo or proposal for AGM/EGM e-voting?",
    a: "Companies can select 'Corporate Sales' on this form or email admin@shareholdervoting.in directly. Our corporate governance team provides customized deployment proposals and compliance documentation."
  },
  {
    q: "How do individual shareholders get help during an active voting window?",
    a: "Shareholders experiencing OTP delivery, authentication, or folio verification issues can submit under 'Shareholder Support' or email support@shareholdervoting.in. Live meeting support is active during scheduled voting periods."
  },
  {
    q: "How are complaints and investor grievances handled?",
    a: "Select 'Complaint / Grievance' to lodge a formal statutory grievance. Every complaint generates an auditable ticket reviewed by our compliance officer per statutory compliance protocols."
  },
  {
    q: "What are the official communication emails for Vote India Secure?",
    a: "Our primary communication channels are support@shareholdervoting.in (general support, shareholder queries & grievances) and admin@shareholdervoting.in (corporate governance, sales & partnerships)."
  }
];

const contactFaqSchema = createFaqSchema(
  contactFaqs.map(f => ({ question: f.q, answer: f.a }))
);

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  blue: { bg: "bg-blue-500/20", border: "border-blue-400/30", text: "text-blue-300" },
  cyan: { bg: "bg-cyan-500/20", border: "border-cyan-400/30", text: "text-cyan-300" },
  indigo: { bg: "bg-indigo-500/20", border: "border-indigo-400/30", text: "text-indigo-300" }
};

interface SubmittedTicket {
  id: string;
  type: string;
  email: string;
  department: string;
  sla: string;
  subject: string;
}

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copiedTicket, setCopiedTicket] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<SubmittedTicket | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    email: "",
    phone: "",
    inquiryType: "",
    subject: "",
    message: ""
  });

  const selectedInquiry = inquiryTypes.find(t => t.value === formData.inquiryType);

  const handleCopyTicket = (ticketId: string) => {
    navigator.clipboard.writeText(ticketId);
    setCopiedTicket(true);
    toast.success("Query Reference ID copied to clipboard!");
    setTimeout(() => setCopiedTicket(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.inquiryType) {
      toast.error("Please select an inquiry type.");
      return;
    }

    if (!turnstileToken) {
      toast.error("Please complete the security verification challenge before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const inquiryLabel = selectedInquiry?.label || formData.inquiryType;

      const payload = {
        firstname: formData.name.split(' ')[0] || formData.name,
        lastname: formData.organization || "N/A",
        email: formData.email,
        subject: formData.subject || `${inquiryLabel} from ${formData.name}`,
        message: formData.message,
        name: formData.name,
        company: formData.organization,
        phone: formData.phone,
        inquiryType: formData.inquiryType,
        turnstile_token: turnstileToken,
      };

      const { data, error } = await supabase.functions.invoke('send-contact-message', {
        body: payload,
        headers: {
          "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`,
          "apikey": env.SUPABASE_ANON_KEY
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to send message");

      const generatedTicketId = data?.ticketId || `VS-${Date.now().toString().slice(-6)}`;
      
      setSubmittedTicket({
        id: generatedTicketId,
        type: inquiryLabel,
        email: formData.email,
        department: data?.department || "Support Operations Desk",
        sla: data?.sla || "Within 2-24 hours",
        subject: formData.subject || inquiryLabel
      });

      toast.success(`Inquiry registered! Reference ID: #${generatedTicketId}. Confirmation email sent to ${formData.email}.`);
      setFormData({ name: "", organization: "", email: "", phone: "", inquiryType: "", subject: "", message: "" });
      turnstileRef.current?.reset();
      setTurnstileToken("");
    } catch (error: unknown) {
      turnstileRef.current?.reset();
      setTurnstileToken("");
      toast.error((error as Error).message || "Failed to send message. Please email support@shareholdervoting.in directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedTicket(null);
    setFormData({ name: "", organization: "", email: "", phone: "", inquiryType: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#020817] text-white">
      <SEO
        title="Contact Us | Vote India Secure Shareholder Voting Support & Sales"
        description="Get in touch with Vote India Secure for shareholder support, corporate e-voting deployments, technical help, or meeting consultations. Official support at support@shareholdervoting.in."
        canonical="/contact"
        schemas={[contactPageSchema, breadcrumbSchema, contactFaqSchema]}
      />

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Globe className="w-3.5 h-3.5" />
            24/7 Global Corporate & Shareholder Support
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tight">
            Get in <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed">
            Whether you're a company, shareholder, or visitor — we'd love to hear from you. Reach out for support, sales, partnerships, or assistance.
          </p>
        </div>

        {/* Inquiry Type Selector Cards */}
        {!submittedTicket && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-12"
          >
            <h2 className="text-center text-lg font-bold text-slate-200 mb-6">What can we help you with?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {inquiryTypes.map((type) => {
                const isSelected = formData.inquiryType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, inquiryType: type.value })}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border backdrop-blur-xl text-center transition-all duration-300 cursor-pointer group
                      ${isSelected
                        ? "bg-blue-500/20 border-cyan-400/60 shadow-lg shadow-blue-500/15 scale-[1.03]"
                        : "bg-[#0d1b2a]/70 border-white/10 hover:border-white/25 hover:bg-[#0d1b2a]/90"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                      ${isSelected
                        ? "bg-cyan-400/20 text-cyan-300 scale-110"
                        : "bg-white/5 text-slate-400 group-hover:text-slate-200 group-hover:bg-white/10"
                      }`}>
                      <type.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-bold transition-colors ${isSelected ? "text-cyan-300" : "text-slate-300"}`}>
                      {type.label}
                    </span>
                    {isSelected && (
                      <motion.div
                        layoutId="inquiry-indicator"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-cyan-400 rounded-full"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            {selectedInquiry && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                key={selectedInquiry.value}
                className="text-center text-xs text-slate-400 mt-3"
              >
                {selectedInquiry.description}
              </motion.p>
            )}
          </motion.div>
        )}

        <div className="grid md:grid-cols-5 gap-10 items-start">
          
          {/* Contact Information Cards */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="md:col-span-2 space-y-6"
          >
            <div className="bg-[#0d1b2a]/90 border border-white/15 rounded-3xl p-8 backdrop-blur-xl shadow-xl space-y-6">
              <h2 className="text-2xl font-black text-white">Contact Information</h2>
              
              {/* Address */}
              <div className="flex gap-4 items-start group">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 text-cyan-300 group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Operations Support</h3>
                  <div className="text-slate-200 text-xs mt-1 leading-relaxed font-normal">
                    Vote India Secure<br/>
                    Corporate Governance &amp; Cloud Operations Support Desk<br/>
                    Republic of India
                  </div>
                </div>
              </div>

              {/* Emails */}
              <div className="flex gap-4 items-start group">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shrink-0 text-cyan-300 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Email Inboxes (Zoho Mail)</h3>
                  <div className="space-y-2.5 mt-2">
                    <div>
                      <a href="mailto:support@shareholdervoting.in" className="flex items-center gap-2 text-cyan-300 text-sm font-bold hover:underline hover:text-cyan-200 transition-colors">
                        <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        support@shareholdervoting.in
                      </a>
                      <p className="text-[10px] text-slate-400 ml-5.5 mt-0.5">Shareholder support, tech help & statutory grievances</p>
                    </div>
                    <div>
                      <a href="mailto:admin@shareholdervoting.in" className="flex items-center gap-2 text-cyan-300 text-sm font-bold hover:underline hover:text-cyan-200 transition-colors">
                        <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        admin@shareholdervoting.in
                      </a>
                      <p className="text-[10px] text-slate-400 ml-5.5 mt-0.5">Corporate sales, proposals, partnerships & admin</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Website */}
              <div className="flex gap-4 items-start group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-300 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Official Portal</h3>
                  <a
                    href="https://www.shareholdervoting.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-300 text-sm mt-1 font-bold hover:underline hover:text-cyan-200 transition-colors"
                  >
                    www.shareholdervoting.in
                  </a>
                </div>
              </div>

              {/* Support Hours */}
              <div className="flex gap-4 items-start group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-300 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Support Hours</h3>
                  <p className="text-slate-200 text-xs mt-1 font-normal">
                    Mon – Sat: 9:00 AM – 6:00 PM IST<br/>
                    Live Meeting Support: 24/7 during AGM/EGM
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-emerald-400 text-[11px] font-bold">Desk Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/60 to-cyan-950/60 border border-blue-400/30 backdrop-blur-xl hover:border-cyan-400/50 transition-colors duration-300"
            >
              <div className="flex items-center gap-3 text-cyan-300 font-bold text-sm mb-2">
                <Shield className="w-4 h-4" />
                <span>Response Time Guarantee</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-200 leading-relaxed font-normal">
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  General inquiries — within 24 hours
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  Corporate sales — within 2 business hours
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  Grievances — within 4 business hours
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  Technical issues — within 1 business hour
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Form or Ticket Confirmation */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="md:col-span-3"
          >
            {submittedTicket ? (
              /* Success Ticket Confirmation Card */
              <div className="bg-[#0d1b2a]/95 border border-cyan-400/40 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Inquiry Registered!</h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Your query has been logged and forwarded to our official Zoho Mail desk.
                    </p>
                  </div>
                </div>

                {/* Ticket ID Box */}
                <div className="bg-[#020817] border border-cyan-500/30 rounded-2xl p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                      Query Reference Number
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-mono font-black text-cyan-300">
                        #{submittedTicket.id}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyTicket(submittedTicket.id)}
                        className="h-8 text-xs border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 gap-1.5"
                      >
                        {copiedTicket ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedTicket ? "Copied" : "Copy ID"}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Category:</span>
                      <span className="text-white font-semibold">{submittedTicket.type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Assigned Department:</span>
                      <span className="text-cyan-300 font-semibold">{submittedTicket.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Target Response SLA:</span>
                      <span className="text-emerald-400 font-semibold">{submittedTicket.sla}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Confirmation Sent To:</span>
                      <span className="text-white font-semibold truncate block">{submittedTicket.email}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-400/20 text-xs text-slate-200 leading-relaxed space-y-1.5">
                  <p className="flex items-center gap-2 font-bold text-cyan-300">
                    <Mail className="w-4 h-4" /> An acknowledgment email was sent to your inbox.
                  </p>
                  <p className="text-slate-300">
                    Our team will reply directly from <strong>support@shareholdervoting.in</strong> or <strong>admin@shareholdervoting.in</strong>. You can reply directly to that email at any time to provide more details.
                  </p>
                </div>

                <Button
                  onClick={handleResetForm}
                  variant="outline"
                  className="w-full border-white/20 hover:bg-white/10 text-white font-bold rounded-xl text-sm gap-2 h-12"
                >
                  <RotateCcw className="w-4 h-4" />
                  Submit Another Inquiry
                </Button>
              </div>
            ) : (
              /* Contact Form */
              <div className="bg-[#0d1b2a]/90 border border-white/15 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl">
                <h2 className="text-2xl font-black text-white mb-1">Send Us a Message</h2>
                <p className="text-xs text-slate-300 mb-8 font-normal">
                  {selectedInquiry
                    ? <>You selected <span className="text-cyan-300 font-bold">{selectedInquiry.label}</span>. Fill in the details below and we'll get back to you promptly.</>
                    : "Select an inquiry type above, then fill in your details below."
                  }
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Inquiry Type (dropdown fallback) */}
                  <div className="space-y-2">
                    <Label htmlFor="inquiryType" className="text-xs font-bold text-slate-100">Inquiry Type *</Label>
                    <Select value={formData.inquiryType} onValueChange={(value) => setFormData({ ...formData, inquiryType: value })}>
                      <SelectTrigger id="inquiryType" className="bg-black/60 border-white/20 text-white rounded-xl font-medium focus:border-cyan-400/60 focus:ring-cyan-400/20">
                        <SelectValue placeholder="Select inquiry type..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0d1b2a] border-white/20 text-white">
                        {inquiryTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="focus:bg-blue-500/20 focus:text-white">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-bold text-slate-100">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                        className="bg-black/60 border-white/20 text-white rounded-xl font-medium focus:border-cyan-400/60 focus:ring-cyan-400/20 transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organization" className="text-xs font-bold text-slate-100">
                        Organization {formData.inquiryType === "corporate-sales" || formData.inquiryType === "partnership" ? "*" : "(Optional)"}
                      </Label>
                      <Input
                        id="organization"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        placeholder="Company or organization name"
                        className="bg-black/60 border-white/20 text-white rounded-xl font-medium focus:border-cyan-400/60 focus:ring-cyan-400/20 transition-colors"
                        required={formData.inquiryType === "corporate-sales" || formData.inquiryType === "partnership"}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-bold text-slate-100">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="bg-black/60 border-white/20 text-white rounded-xl font-medium focus:border-cyan-400/60 focus:ring-cyan-400/20 transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-bold text-slate-100">Phone Number (Optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="bg-black/60 border-white/20 text-white rounded-xl font-medium focus:border-cyan-400/60 focus:ring-cyan-400/20 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-xs font-bold text-slate-100">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder={
                        formData.inquiryType === "corporate-sales" ? "AGM/EGM e-voting deployment inquiry" :
                        formData.inquiryType === "shareholder-support" ? "Issue with voting or login" :
                        formData.inquiryType === "technical-issue" ? "Describe the technical issue briefly" :
                        formData.inquiryType === "complaint" ? "Nature of your complaint" :
                        formData.inquiryType === "partnership" ? "Partnership or integration proposal" :
                        "What is your message about?"
                      }
                      className="bg-black/60 border-white/20 text-white rounded-xl font-medium focus:border-cyan-400/60 focus:ring-cyan-400/20 transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-xs font-bold text-slate-100">Message *</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={
                        formData.inquiryType === "corporate-sales" ? "Tell us about your upcoming AGM/EGM dates, estimated shareholder count, and specific requirements..." :
                        formData.inquiryType === "shareholder-support" ? "Please describe your issue in detail — include your registered email or folio number if applicable..." :
                        formData.inquiryType === "technical-issue" ? "Describe the issue, steps to reproduce, and any error messages you see..." :
                        formData.inquiryType === "complaint" ? "Please describe your complaint in detail. Include dates, reference numbers, and any supporting information..." :
                        formData.inquiryType === "partnership" ? "Tell us about your organization and how you'd like to collaborate..." :
                        "Write your message here..."
                      }
                      className="bg-black/60 border-white/20 text-white rounded-xl font-medium focus:border-cyan-400/60 focus:ring-cyan-400/20 transition-colors"
                      required
                    />
                  </div>

                  {/* Complaint notice */}
                  {formData.inquiryType === "complaint" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p>
                        Your complaint will be registered and assigned an official tracking ID. We take all grievances seriously and aim to resolve them within 4 business hours. You will receive an acknowledgment email immediately.
                      </p>
                    </motion.div>
                  )}

                  {/* Cloudflare Turnstile Bot Protection */}
                  <TurnstileWidget
                    ref={turnstileRef}
                    action="contact"
                    theme="dark"
                    onSuccess={(tok) => setTurnstileToken(tok)}
                    onError={() => setTurnstileToken("")}
                    onExpire={() => setTurnstileToken("")}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.inquiryType}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl text-sm gap-2 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {formData.inquiryType === "complaint" ? "Submit Complaint" :
                         formData.inquiryType === "corporate-sales" ? "Submit Inquiry" :
                         formData.inquiryType === "partnership" ? "Submit Proposal" :
                         "Send Message"}
                      </>
                    )}
                  </Button>

                  <p className="text-[10px] text-slate-400 text-center mt-3">
                    By submitting, you agree to our{" "}
                    <Link to="/privacy-policy" className="text-cyan-400 hover:underline">Privacy Policy</Link>
                    {" "}and{" "}
                    <Link to="/terms-of-service" className="text-cyan-400 hover:underline">Terms of Service</Link>.
                  </p>
                </form>
              </div>
            )}
          </motion.div>

        </div>

        {/* Contact FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-20"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto">Quick answers to common questions about reaching our team and getting support.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {contactFaqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-[#0d1b2a]/90 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl transition-colors hover:border-white/20"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-cyan-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div
                    className={`px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3 ${
                      isOpen ? "block" : "hidden"
                    }`}
                  >
                    {faq.a}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-20"
        >
          <h2 className="text-center text-2xl font-black text-white mb-2">Looking for Something Else?</h2>
          <p className="text-center text-sm text-slate-300 mb-10">Quick links to help you find exactly what you need.</p>
          
          <div className="grid sm:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const colors = colorMap[action.color];
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    to={action.link}
                    className="block bg-[#0d1b2a]/90 border border-white/15 rounded-2xl p-6 backdrop-blur-xl hover:border-cyan-400/40 transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-4 ${colors.text} group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-white text-base mb-1">{action.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">{action.description}</p>
                    <span className="inline-flex items-center gap-1 text-cyan-400 text-xs font-bold group-hover:gap-2 transition-all duration-300">
                      Learn More <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
