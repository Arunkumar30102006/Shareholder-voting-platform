import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2, XCircle, ChevronRight, Upload, X, AlertCircle, Building2,
  FileText, ShieldCheck, FileKey, CheckSquare, UploadCloud, UserCircle, Loader2
} from "lucide-react";
import { SEO } from "@/components/layout/SEO";
import { Head as Helmet } from "vite-react-ssg";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TurnstileWidget, TurnstileWidgetRef } from "@/components/common/TurnstileWidget";

export interface FormDataState {
  companyName: string;
  cin: string;
  pan: string;
  gstin: string;
  companyType: string;
  doi: string;
  exchanges: string[];
  isin: string;
  authorizedCapital: string;
  paidUpCapital: string;
  address: string;
  country: string;
  pinCode: string;
  area: string;
  state: string;
  district: string;
  adminName: string;
  adminDesignation: string;
  adminEmail: string;
  adminPhone: string;
  adminPassword: string;
  adminConfirmPassword: string;
  csName: string;
  csMemNumber: string;
  csEmail: string;
  csPhone: string;
  sebiEmail: string;
  sebiRegNumber: string;
  rtaName: string;
  rtaRegNumber: string;
  declaration: boolean;
  consent: boolean;
}

type ValidationRule = {
  regex?: RegExp;
  message: string;
  custom?: (val: string, allData: FormDataState) => boolean;
};

const STEPS = [
  { id: 1, title: "Company Details", icon: Building2 },
  { id: 2, title: "Admin Account", icon: UserCircle },
  { id: 3, title: "Compliance & CS", icon: ShieldCheck },
  { id: 4, title: "Documents", icon: UploadCloud },
  { id: 5, title: "Review & Submit", icon: CheckSquare }
];

const COMPANY_TYPES = [
  "Public Limited Company",
  "Private Limited Company",
  "One Person Company (OPC)",
  "Limited Liability Partnership (LLP)",
  "Section 8 Company (NGO)",
  "Government Company"
];

const RTAS = [
  "KFin Technologies Ltd",
  "Link Intime India Pvt Ltd",
  "Bigshare Services Pvt Ltd",
  "Cameo Corporate Services Ltd",
  "Niche Technologies Pvt Ltd",
  "Self-managed (no RTA)"
];

const EXCHANGES = [
  { id: "bse", label: "BSE (Bombay Stock Exchange)" },
  { id: "nse", label: "NSE (National Stock Exchange)" },
  { id: "mse", label: "MSE (Metropolitan Stock Exchange)" },
  { id: "none", label: "Not Listed" }
];

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helper?: string;
  prefix?: string;
  error?: string;
  valid?: boolean;
}
const InputField = ({ label, name, type = "text", placeholder = "", helper = "", required = false, prefix = "", disabled = false, value, onChange, onBlur, error, valid }: InputFieldProps) => (
  <div className="space-y-1 w-full">
    <label className="text-sm font-medium text-slate-300">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-3 text-slate-400 font-medium">{prefix}</span>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full h-11 bg-[#020817]/50 border text-white rounded-xl text-sm transition-all outline-none ${prefix ? 'pl-10 pr-10' : 'px-4'} ${error ? 'border-red-500 focus:ring-1 focus:ring-red-500' :
            valid ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500' :
              'border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }`}
        disabled={disabled}
        max={type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
      />
      {valid && <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-4 top-3.5" />}
      {error && <XCircle className="w-4 h-4 text-red-500 absolute right-4 top-3.5" />}
    </div>
    {(helper || error) && (
      <p className={`text-xs ${error ? 'text-red-400' : 'text-slate-500'}`}>
        {error || helper}
      </p>
    )}
  </div>
);

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
  helper?: string;
  error?: string;
  valid?: boolean;
}
const SelectField = ({ label, name, options, helper = "", required = false, value, onChange, onBlur, error, valid }: SelectFieldProps) => (
  <div className="space-y-1 w-full">
    <label className="text-sm font-medium text-slate-300">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full h-11 px-4 bg-[#020817]/50 border text-white rounded-xl text-sm transition-all outline-none appearance-none ${error ? 'border-red-500 focus:ring-1 focus:ring-red-500' :
            valid ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500' :
              'border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }`}
      >
        <option value="" disabled className="text-slate-500">Select an option</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt} className="bg-[#0d1b2a]">{opt}</option>
        ))}
      </select>
      <ChevronRight className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 rotate-90 pointer-events-none" />
    </div>
    {(helper || error) && (
      <p className={`text-xs ${error ? 'text-red-400' : 'text-slate-500'}`}>
        {error || helper}
      </p>
    )}
  </div>
);

interface FileUploadProps {
  label: string;
  name: string;
  accept: string;
  maxSize: number;
  helper?: string;
  required?: boolean;
  file: File | null;
  onFileChange: (name: string, file: File | null, maxSize: number, allowedTypes: string[]) => void;
  onRemove: (name: string) => void;
}
const FileUpload = ({ label, name, accept, maxSize, helper, required = false, file, onFileChange, onRemove }: FileUploadProps) => (
  <div className="space-y-2 p-4 rounded-xl border border-white/10 bg-white/5">
    <label className="text-sm font-medium text-white block">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <p className="text-xs text-slate-400 mb-3">{helper}</p>

    {!file ? (
      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
        <Upload className="w-6 h-6 text-slate-400 mb-2" />
        <span className="text-xs text-slate-400">Click to upload ({maxSize}MB max)</span>
        <input
          type="file"
          className="hidden"
          accept={accept}
          onChange={(e) => onFileChange(name, e.target.files?.[0] || null, maxSize, accept.split(','))}
        />
      </label>
    ) : (
      <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
        <div className="flex items-center gap-3 overflow-hidden">
          <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="truncate">
            <p className="text-sm text-emerald-400 font-medium truncate">{file.name}</p>
            <p className="text-xs text-emerald-500/70">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        <button onClick={() => onRemove(name)} className="p-1 hover:bg-emerald-500/20 rounded-lg transition-colors">
          <X className="w-4 h-4 text-emerald-400" />
        </button>
      </div>
    )}
  </div>
);

export default function CompanyRegister() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormDataState>({
    companyName: "",
    cin: "",
    pan: "",
    gstin: "",
    companyType: "",
    doi: "",
    exchanges: [] as string[],
    isin: "",
    authorizedCapital: "",
    paidUpCapital: "",
    address: "",
    country: "India",
    pinCode: "",
    area: "",
    state: "",
    district: "",

    adminName: "",
    adminDesignation: "",
    adminEmail: "",
    adminPhone: "",
    adminPassword: "",
    adminConfirmPassword: "",

    csName: "",
    csMemNumber: "",
    csEmail: "",
    csPhone: "",
    sebiEmail: "",
    sebiRegNumber: "",
    rtaName: "",
    rtaRegNumber: "",

    declaration: false,
    consent: false
  });

  const [files, setFiles] = useState<Record<string, File | null>>({
    certInc: null,
    boardRes: null,
    panCard: null,
    shareholders: null,
    authLetter: null
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [regId, setRegId] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: FormDataState) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev: FormDataState) => ({ ...prev, [name]: value }));
    }
  };

  const handleExchangeChange = (id: string, checked: boolean) => {
    setFormData((prev: FormDataState) => {
      let newExchanges = [...(prev.exchanges as string[] || [])];
      if (id === "none" && checked) {
        newExchanges = ["none"];
      } else if (checked) {
        newExchanges = newExchanges.filter(e => e !== "none");
        newExchanges.push(id);
      } else {
        newExchanges = newExchanges.filter(e => e !== id);
      }
      return { ...prev, exchanges: newExchanges };
    });
  };

  const handleFileChange = (name: string, file: File | null, maxSize: number, allowedTypes: string[]) => {
    if (!file) {
      setFiles(prev => ({ ...prev, [name]: null }));
      return;
    }
    
    // Add dot to match the format in allowedTypes (e.g., '.pdf')
    const ext = `.${file.name.split('.').pop()?.toLowerCase() || ""}`;
    
    // Check if extension matches OR if mime type contains the string (e.g., 'pdf')
    const isValidType = allowedTypes.includes(ext) || allowedTypes.some(t => file.type.toLowerCase().includes(t.replace('.', '')));
    
    if (!isValidType) {
      alert(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`);
      return;
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File too large. Maximum size is ${maxSize}MB`);
      return;
    }
    
    setFiles(prev => ({ ...prev, [name]: file }));
  };

  const handleFileRemove = (name: string) => {
    setFiles(prev => ({ ...prev, [name]: null }));
  };

  const handleBlur = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  const rules: Record<string, ValidationRule> = {
    companyName: { custom: v => v.length > 2, message: "Required" },
    cin: { regex: /^[LUu]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{2,3}[0-9]{6}$/, message: "Invalid CIN format" },
    pan: { regex: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: "Invalid PAN format (e.g., AABCT1234D)" },
    gstin: { regex: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: "Invalid GSTIN format" },
    companyType: { custom: v => v !== "", message: "Select company type" },
    doi: { custom: v => v !== "", message: "Select date of incorporation" },
    isin: { regex: /^IN[A-Z0-9]{10}$/, message: "Invalid ISIN format (e.g., INE009A01021)" },
    authorizedCapital: { custom: v => Number(v.replace(/,/g, '')) > 0, message: "Required" },
    paidUpCapital: { custom: (v, all) => Number(v.replace(/,/g, '')) > 0 && Number(v.replace(/,/g, '')) <= Number(all.authorizedCapital.replace(/,/g, '')), message: "Must be ≤ Authorized Capital" },
    address: { custom: v => v.length > 5, message: "Address too short" },
    pinCode: { regex: /^[1-9][0-9]{5}$/, message: "Invalid PIN code" },
    state: { custom: v => v !== "", message: "Required" },

    adminName: { custom: v => v.length > 2, message: "Required" },
    adminDesignation: { custom: v => v.length > 2, message: "Required" },
    adminEmail: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
    adminPhone: { regex: /^(\+91)?[6-9][0-9]{9}$/, message: "Invalid phone number" },
    adminPassword: { custom: v => v.length >= 8, message: "Password must be at least 8 characters" },
    adminConfirmPassword: { custom: (v, all) => v === all.adminPassword, message: "Passwords do not match" },

    csName: { custom: v => v.length > 2, message: "Required" },
    csMemNumber: { regex: /^[AaFf][0-9]{5}$/, message: "Format: A12345 or F12345" },
    csEmail: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
    csPhone: { regex: /^(\+91)?[6-9][0-9]{9}$/, message: "Invalid phone number" },
    sebiEmail: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
    rtaName: { custom: v => v !== "", message: "Select RTA" },
    rtaRegNumber: { custom: v => v.length > 3, message: "Required" }
  };

  const getError = (field: string) => {
    if (!touched[field]) return "";
    const val = formData[field as keyof FormDataState];
    const rule = rules[field];
    if (!rule) return "";

    if (field === "gstin" && !val) return "";
    if (field === "isin" && (!formData.exchanges.includes("bse") && !formData.exchanges.includes("nse"))) return "";
    if (field === "rtaRegNumber" && formData.rtaName === "Self-managed (no RTA)") return "";
    if (field === "sebiRegNumber") return "";

    if (rule.regex && !rule.regex.test(val as string)) return rule.message;
    if (rule.custom && !rule.custom(val as string, formData)) return rule.message;
    return "";
  };

  const isValid = (field: string) => !!(touched[field] && !getError(field) && formData[field as keyof FormDataState]);

  const checkStepValidity = (s: number) => {
    if (s === 1) {
      const required = ["companyName", "cin", "pan", "companyType", "doi", "authorizedCapital", "paidUpCapital", "address", "pinCode", "state"];
      if (formData.exchanges.includes("bse") || formData.exchanges.includes("nse")) required.push("isin");
      if (formData.gstin && getError("gstin")) return false;
      return required.every(f => {
        const val = formData[f as keyof FormDataState];
        const rule = rules[f];
        if (!val) return false;
        if (rule.regex && !rule.regex.test(val as string)) return false;
        if (rule.custom && !rule.custom(val as string, formData)) return false;
        return true;
      }) && formData.exchanges.length > 0;
    }
    if (s === 2) {
      const required = ["adminName", "adminDesignation", "adminEmail", "adminPhone", "adminPassword", "adminConfirmPassword"];
      return required.every(f => {
        const val = formData[f as keyof FormDataState];
        const rule = rules[f];
        if (!val) return false;
        if (rule.regex && !rule.regex.test(val as string)) return false;
        if (rule.custom && !rule.custom(val as string, formData)) return false;
        return true;
      });
    }
    if (s === 3) {
      const required = ["csName", "csMemNumber", "csEmail", "csPhone", "sebiEmail", "rtaName"];
      if (formData.rtaName && formData.rtaName !== "Self-managed (no RTA)") required.push("rtaRegNumber");
      return required.every(f => {
        const val = formData[f as keyof FormDataState];
        const rule = rules[f];
        if (!val) return false;
        if (rule.regex && !rule.regex.test(val as string)) return false;
        if (rule.custom && !rule.custom(val as string, formData)) return false;
        return true;
      });
    }
    if (s === 4) {
      return !!files.certInc && !!files.boardRes && !!files.panCard && !!files.authLetter;
    }
    return false;
  };

  const submitForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.declaration || !formData.consent) return;

    if (!turnstileToken) {
      toast.error("Please complete the security verification challenge before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 0. Pre-flight check: Ensure CIN doesn't already exist to prevent partial failures
      const { data: existingCompany } = await supabase
        .from("companies")
        .select("id")
        .eq("cin_number", formData.cin)
        .maybeSingle();

      if (existingCompany) {
        throw new Error("A company with this CIN number is already registered. Please use a different CIN.");
      }

      // 1. Sign up admin user using the custom password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.adminEmail,
        password: formData.adminPassword,
        options: {
          data: {
            full_name: formData.adminName,
          }
        }
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          throw new Error("This admin email is already registered in our system. Please use a different email or log in.");
        }
        throw new Error(authError.message);
      }

      const userId = authData.user?.id;
      if (!userId) throw new Error("Could not create user account. The email might be blocked.");

      // 2. Insert Company
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .insert({
          company_name: formData.companyName,
          cin_number: formData.cin,
          pan_number: formData.pan,
          gstin: formData.gstin || null,
          company_type: formData.companyType,
          date_of_incorporation: formData.doi,
          exchanges: formData.exchanges,
          isin_number: formData.isin || null,
          authorized_capital: parseFloat(formData.authorizedCapital.replace(/,/g, '')),
          paid_up_capital: parseFloat(formData.paidUpCapital.replace(/,/g, '')),
          registered_address: formData.address,
          country: formData.country,
          state: formData.state,
          district: formData.district || null,
          pin_code: formData.pinCode,
          contact_email: formData.adminEmail,
          contact_phone: formData.adminPhone,
          cs_name: formData.csName,
          cs_membership_number: formData.csMemNumber,
          cs_email: formData.csEmail,
          cs_phone: formData.csPhone,
          sebi_email: formData.sebiEmail,
          sebi_reg_number: formData.sebiRegNumber || null,
          rta_name: formData.rtaName,
          rta_reg_number: formData.rtaRegNumber || null,
        })
        .select()
        .single();

      if (companyError) {
        if (companyError.message.includes("authorized_capital") || companyError.message.includes("schema cache")) {
           throw new Error("Database schema out of sync. Please run 'supabase_setup.sql' in your Supabase SQL editor and click 'Reload API' in the dashboard.");
        }
        if (companyError.message.includes("companies_cin_number_key")) {
           throw new Error("A company with this CIN number is already registered. Please verify your CIN or contact support.");
        }
        throw new Error(companyError.message);
      }

      // 3. Insert Admin record
      let { error: adminError } = await supabase
        .from("company_admins")
        .insert({
          user_id: userId,
          company_id: companyData.id,
          name: formData.adminName,
          designation: formData.adminDesignation,
          email: formData.adminEmail,
          phone: formData.adminPhone,
          role: "admin"
        });

      // Fallback for legacy database schemas where the column was named "full_name" instead of "name"
      if (adminError && adminError.message.includes("full_name")) {
         const { error: retryError } = await supabase
           .from("company_admins")
           .insert({
             user_id: userId,
             company_id: companyData.id,
             name: formData.adminName,
             full_name: formData.adminName, // Provide both to satisfy legacy NOT NULL constraints
             designation: formData.adminDesignation,
             email: formData.adminEmail,
             phone: formData.adminPhone,
             role: "admin"
           });
         adminError = retryError;
      }

      if (adminError) throw new Error(adminError.message);

      const newRegId = `VIS-CO-${Math.floor(Math.random() * 900000) + 100000}`;
      setRegId(newRegId);
      
      // Send the real Welcome Email using Supabase Edge Functions (Resend)
      await supabase.functions.invoke("send-welcome-email", {
        body: {
          email: formData.adminEmail,
          companyName: formData.companyName,
          cin: formData.cin,
          adminName: formData.adminName,
          address: formData.address,
          phone: formData.adminPhone,
          regId: newRegId,
          password: "The password you set during registration",
          turnstile_token: turnstileToken,
        }
      });

      toast.success("Registration successful! Welcome email sent.");
      setIsSuccess(true);
    } catch (error: unknown) {
      turnstileRef.current?.reset();
      setTurnstileToken("");
      console.error("Registration error:", error);
      toast.error((error as Error).message, { duration: 8000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative pt-28 pb-20 bg-[#0d1b2a]">
      <SEO
        title="Company Registration & Onboarding | Vote India Secure"
        description="Register your corporate enterprise, private limited company, or RTA to conduct secure electronic shareholder voting in compliance with MCA and SEBI guidelines."
        canonical="/company-register"
      />

      <main className="container mx-auto px-4 max-w-4xl">
        {!isSuccess ? (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-white mb-2">Company Registration</h1>
              <p className="text-slate-300 text-sm">Register your organization to conduct electronic voting in alignment with MCA Rule 20 and SEBI LODR Regulation 44.</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between mb-12 overflow-x-auto pb-4 hide-scrollbar">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center flex-shrink-0">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${s.id < step ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" :
                      s.id === step ? "bg-blue-500/20 border-blue-500/40 text-blue-400" :
                        "bg-white/5 border-white/10 text-slate-500"
                    }`}>
                    <s.icon className="w-4 h-4" />
                    <span className="text-xs font-bold">{s.title}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-8 sm:w-12 h-px mx-2 ${s.id < step ? "bg-emerald-500/50" : "bg-white/10"}`} />
                  )}
                </div>
              ))}
            </div>

            <div className="bg-[#020817]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
              <AnimatePresence mode="wait">

                {/* STEP 1 */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-400" /> Company Details
                    </h2>

                    <div className="grid md:grid-cols-2 gap-5 mb-8">
                      <InputField label="Company Name" name="companyName" required value={formData.companyName} onChange={handleChange} onBlur={() => handleBlur("companyName")} error={getError("companyName")} valid={isValid("companyName")} />
                      <InputField label="Corporate Identification Number (CIN)" name="cin" placeholder="L12345MH2000PLC123456" required helper="21-digit alphanumeric CIN" value={formData.cin} onChange={handleChange} onBlur={() => handleBlur("cin")} error={getError("cin")} valid={isValid("cin")} />

                      <InputField label="PAN of Company" name="pan" placeholder="AABCT1234D" required helper="Company PAN as registered with Income Tax Department" value={formData.pan} onChange={handleChange} onBlur={() => handleBlur("pan")} error={getError("pan")} valid={isValid("pan")} />
                      <InputField label="GSTIN (Optional)" name="gstin" placeholder="27AABCT1234D1ZV" helper="15-digit GST number (leave blank if exempt)" value={formData.gstin} onChange={handleChange} onBlur={() => handleBlur("gstin")} error={getError("gstin")} valid={isValid("gstin")} />

                      <SelectField label="Type of Company" name="companyType" options={COMPANY_TYPES} required value={formData.companyType} onChange={handleChange} onBlur={() => handleBlur("companyType")} error={getError("companyType")} valid={isValid("companyType")} />
                      <InputField label="Date of Incorporation" name="doi" type="date" required helper="As per MCA records" value={formData.doi} onChange={handleChange} onBlur={() => handleBlur("doi")} error={getError("doi")} valid={isValid("doi")} />
                    </div>

                    <div className="mb-8">
                      <label className="text-sm font-medium text-slate-300 block mb-3">Registered Stock Exchange (if listed) <span className="text-red-400">*</span></label>
                      <div className="grid grid-cols-2 gap-3 mb-1">
                        {EXCHANGES.map(ex => (
                          <label key={ex.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formData.exchanges.includes(ex.id) ? 'bg-blue-500/10 border-blue-500/30' : 'bg-[#020817]/50 border-white/10 hover:border-white/20'
                            } ${(ex.id !== 'none' && formData.exchanges.includes('none')) ? 'opacity-50 pointer-events-none' : ''}`}>
                            <input
                              type="checkbox"
                              checked={formData.exchanges.includes(ex.id)}
                              onChange={(e) => handleExchangeChange(ex.id, e.target.checked)}
                              className="w-4 h-4 rounded border-white/20 bg-black/50 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                            />
                            <span className="text-sm text-slate-200">{ex.label}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">Select all exchanges where company is listed</p>
                    </div>

                    {(formData.exchanges.includes("bse") || formData.exchanges.includes("nse")) && (
                      <div className="mb-8 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                        <InputField label="ISIN Number" name="isin" placeholder="INE009A01021" required helper="International Securities Identification Number" value={formData.isin} onChange={handleChange} onBlur={() => handleBlur("isin")} error={getError("isin")} valid={isValid("isin")} />
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-5 mb-8 border-t border-white/5 pt-6">
                      <InputField label="Authorized Share Capital" name="authorizedCapital" prefix="₹" placeholder="10,00,00,000" required helper="In Indian Rupees (INR)" value={formData.authorizedCapital} onChange={handleChange} onBlur={() => handleBlur("authorizedCapital")} error={getError("authorizedCapital")} valid={isValid("authorizedCapital")} />
                      <InputField label="Paid-up Share Capital" name="paidUpCapital" prefix="₹" placeholder="5,00,00,000" required helper="Must be ≤ Authorized Share Capital" value={formData.paidUpCapital} onChange={handleChange} onBlur={() => handleBlur("paidUpCapital")} error={getError("paidUpCapital")} valid={isValid("paidUpCapital")} />
                    </div>

                    <div className="border-t border-white/5 pt-6 space-y-5">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Registered Address</h3>
                      <InputField label="Full Address" name="address" required value={formData.address} onChange={handleChange} onBlur={() => handleBlur("address")} error={getError("address")} valid={isValid("address")} />
                      <div className="grid grid-cols-2 gap-5">
                        <InputField label="Country" name="country" disabled value={formData.country} onChange={handleChange} onBlur={() => handleBlur("country")} error={getError("country")} valid={isValid("country")} />
                        <InputField label="State" name="state" required value={formData.state} onChange={handleChange} onBlur={() => handleBlur("state")} error={getError("state")} valid={isValid("state")} />
                        <InputField label="District" name="district" value={formData.district} onChange={handleChange} onBlur={() => handleBlur("district")} error={getError("district")} valid={isValid("district")} />
                        <InputField label="PIN Code" name="pinCode" placeholder="400001" required value={formData.pinCode} onChange={handleChange} onBlur={() => handleBlur("pinCode")} error={getError("pinCode")} valid={isValid("pinCode")} />
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                      <Button size="lg" className="px-8" disabled={!checkStepValidity(1)} onClick={() => setStep(2)}>
                        Next: Admin Account <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <UserCircle className="w-5 h-5 text-blue-400" /> Platform Admin Account
                    </h2>
                    <p className="text-sm text-slate-400 mb-6">This account will have full administrative access to create voting events.</p>

                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      <InputField label="Full Name" name="adminName" required value={formData.adminName} onChange={handleChange} onBlur={() => handleBlur("adminName")} error={getError("adminName")} valid={isValid("adminName")} />
                      <InputField label="Designation" name="adminDesignation" placeholder="e.g. Chief Financial Officer" required value={formData.adminDesignation} onChange={handleChange} onBlur={() => handleBlur("adminDesignation")} error={getError("adminDesignation")} valid={isValid("adminDesignation")} />
                      <InputField label="Official Email" name="adminEmail" type="email" required value={formData.adminEmail} onChange={handleChange} onBlur={() => handleBlur("adminEmail")} error={getError("adminEmail")} valid={isValid("adminEmail")} />
                      <InputField label="Mobile Number" name="adminPhone" placeholder="+91" required value={formData.adminPhone} onChange={handleChange} onBlur={() => handleBlur("adminPhone")} error={getError("adminPhone")} valid={isValid("adminPhone")} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                      <InputField label="Admin Password" name="adminPassword" type="password" required helper="Minimum 8 characters" value={formData.adminPassword} onChange={handleChange} onBlur={() => handleBlur("adminPassword")} error={getError("adminPassword")} valid={isValid("adminPassword")} />
                      <InputField label="Confirm Password" name="adminConfirmPassword" type="password" required value={formData.adminConfirmPassword} onChange={handleChange} onBlur={() => handleBlur("adminConfirmPassword")} error={getError("adminConfirmPassword")} valid={isValid("adminConfirmPassword")} />
                    </div>

                    <div className="mt-8 flex justify-between">
                      <Button variant="outline" size="lg" onClick={() => setStep(1)} className="border-white/10">Back</Button>
                      <Button size="lg" className="px-8" disabled={!checkStepValidity(2)} onClick={() => setStep(3)}>
                        Next: Compliance <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-400" /> Scrutinizer & Compliance Details
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <InputField label="Name of Company Secretary (CS)" name="csName" placeholder="CS Priya Sharma" required helper="Practising CS who will act as scrutinizer" value={formData.csName} onChange={handleChange} onBlur={() => handleBlur("csName")} error={getError("csName")} valid={isValid("csName")} />
                      <InputField label="CS Membership Number" name="csMemNumber" placeholder="A54321" required helper="ICSI Certificate of Practice number" value={formData.csMemNumber} onChange={handleChange} onBlur={() => handleBlur("csMemNumber")} error={getError("csMemNumber")} valid={isValid("csMemNumber")} />
                      <InputField label="CS Email Address" name="csEmail" type="email" required value={formData.csEmail} onChange={handleChange} onBlur={() => handleBlur("csEmail")} error={getError("csEmail")} valid={isValid("csEmail")} />
                      <InputField label="CS Phone Number" name="csPhone" placeholder="+91" required value={formData.csPhone} onChange={handleChange} onBlur={() => handleBlur("csPhone")} error={getError("csPhone")} valid={isValid("csPhone")} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-white/5 mb-8">
                      <InputField label="Registered Email for SEBI" name="sebiEmail" type="email" required helper="This email is used for all regulatory filings" value={formData.sebiEmail} onChange={handleChange} onBlur={() => handleBlur("sebiEmail")} error={getError("sebiEmail")} valid={isValid("sebiEmail")} />
                      <InputField label="SEBI Registration Number (Optional)" name="sebiRegNumber" placeholder="INZ000123456" helper="Leave blank if not a SEBI-registered intermediary" value={formData.sebiRegNumber} onChange={handleChange} onBlur={() => handleBlur("sebiRegNumber")} error={getError("sebiRegNumber")} valid={isValid("sebiRegNumber")} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                      <SelectField label="Registrar & Transfer Agent (RTA)" name="rtaName" options={RTAS} required helper="Your company's share transfer agent" value={formData.rtaName} onChange={handleChange} onBlur={() => handleBlur("rtaName")} error={getError("rtaName")} valid={isValid("rtaName")} />
                      {formData.rtaName && formData.rtaName !== "Self-managed (no RTA)" && (
                        <InputField label="RTA Registration Number" name="rtaRegNumber" placeholder="INR000000221" required value={formData.rtaRegNumber} onChange={handleChange} onBlur={() => handleBlur("rtaRegNumber")} error={getError("rtaRegNumber")} valid={isValid("rtaRegNumber")} />
                      )}
                    </div>

                    <div className="mt-8 flex justify-between">
                      <Button variant="outline" size="lg" onClick={() => setStep(2)} className="border-white/10">Back</Button>
                      <Button size="lg" className="px-8" disabled={!checkStepValidity(3)} onClick={() => setStep(4)}>
                        Next: Documents <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4 */}
                {step === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <UploadCloud className="w-5 h-5 text-blue-400" /> Document Upload
                    </h2>
                    <p className="text-sm text-slate-400 mb-6">Upload mandatory documents for verification. All files are securely encrypted.</p>

                    <div className="space-y-4 mb-8">
                      <FileUpload label="Certificate of Incorporation" name="certInc" accept=".pdf" maxSize={5} required helper="Issued by Ministry of Corporate Affairs (MCA)" file={files.certInc} onFileChange={handleFileChange} onRemove={handleFileRemove} />
                      <FileUpload label="Board Resolution for E-Voting" name="boardRes" accept=".pdf" maxSize={5} required helper="Board resolution authorizing use of e-voting platform" file={files.boardRes} onFileChange={handleFileChange} onRemove={handleFileRemove} />
                      <FileUpload label="Company PAN Card" name="panCard" accept=".pdf,.jpg,.png" maxSize={2} required helper="Scanned copy of official PAN card" file={files.panCard} onFileChange={handleFileChange} onRemove={handleFileRemove} />
                      <FileUpload label="Authorized Signatory Letter" name="authLetter" accept=".pdf" maxSize={2} required helper="Letter authorizing the admin to register on behalf of the company" file={files.authLetter} onFileChange={handleFileChange} onRemove={handleFileRemove} />
                      <FileUpload label="List of Shareholders (Optional)" name="shareholders" accept=".xlsx,.csv" maxSize={10} helper="You can upload this later from your Company Portal" file={files.shareholders} onFileChange={handleFileChange} onRemove={handleFileRemove} />
                    </div>

                    <div className="mt-8 flex justify-between">
                      <Button variant="outline" size="lg" onClick={() => setStep(3)} className="border-white/10">Back</Button>
                      <Button size="lg" className="px-8" disabled={!checkStepValidity(4)} onClick={() => setStep(5)}>
                        Review & Submit <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 5 */}
                {step === 5 && (
                  <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-blue-400" /> Review & Declaration
                    </h2>

                    <div className="bg-black/20 rounded-xl p-5 mb-6 space-y-6">
                      <div>
                        <h3 className="text-sm font-bold text-white border-b border-white/10 pb-2 mb-3">Company Details</h3>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                          <span className="text-slate-500">Name:</span><span className="text-white">{formData.companyName}</span>
                          <span className="text-slate-500">CIN:</span><span className="text-white">{formData.cin}</span>
                          <span className="text-slate-500">PAN:</span><span className="text-white">{formData.pan}</span>
                          <span className="text-slate-500">Type:</span><span className="text-white">{formData.companyType}</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white border-b border-white/10 pb-2 mb-3">Admin Account</h3>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                          <span className="text-slate-500">Admin:</span><span className="text-white">{formData.adminName} ({formData.adminDesignation})</span>
                          <span className="text-slate-500">Email:</span><span className="text-white">{formData.adminEmail}</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white border-b border-white/10 pb-2 mb-3">Compliance Details</h3>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                          <span className="text-slate-500">Scrutinizer (CS):</span><span className="text-white">{formData.csName} ({formData.csMemNumber})</span>
                          <span className="text-slate-500">RTA:</span><span className="text-white">{formData.rtaName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
                        <input type="checkbox" name="declaration" checked={formData.declaration} onChange={handleChange} className="mt-1 w-5 h-5 rounded border-white/20 bg-black/50 text-blue-500 focus:ring-offset-0" />
                        <span className="text-sm text-slate-300 leading-relaxed">
                          I hereby declare that the information provided is true and accurate to the best of my knowledge. I am authorized to register this company on the e-voting platform. I agree to the Terms of Service and SEBI Compliance guidelines.
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
                        <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} className="mt-1 w-5 h-5 rounded border-white/20 bg-black/50 text-blue-500 focus:ring-offset-0" />
                        <span className="text-sm text-slate-300 leading-relaxed">
                          I consent to Vote India Secure processing company and shareholder data in accordance with the Privacy Policy and IT Act 2000.
                        </span>
                      </label>
                    </div>

                    {/* Cloudflare Turnstile Bot Protection */}
                    <TurnstileWidget
                      ref={turnstileRef}
                      action="company-register"
                      theme="dark"
                      onSuccess={(tok) => setTurnstileToken(tok)}
                      onError={() => setTurnstileToken("")}
                      onExpire={() => setTurnstileToken("")}
                    />

                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="lg" onClick={() => setStep(4)} className="border-white/10" disabled={isSubmitting}>Back</Button>
                      <Button size="lg" className="px-8 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={!formData.declaration || !formData.consent || isSubmitting} onClick={submitForm}>
                        {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting securely...</> : "Submit Registration"}
                      </Button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
              <div className="relative w-full h-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center rounded-full">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">Registration Submitted!</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Your registration is under review. You will receive a confirmation email within 24-48 hours.
            </p>

            <div className="bg-[#020817]/60 border border-white/10 rounded-2xl p-6 inline-block mb-8 max-w-lg w-full">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Registration Details</p>
              
              <div className="space-y-4 text-left">
                <div>
                  <p className="text-xs text-slate-500">Company Registration ID</p>
                  <p className="text-lg font-mono font-bold text-white">{regId}</p>
                </div>
                
                <div>
                  <p className="text-xs text-slate-500">Admin Login Email</p>
                  <p className="text-base font-bold text-blue-400">{formData.adminEmail}</p>
                </div>

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl relative">
                  <p className="text-xs text-emerald-500 font-bold uppercase mb-1">Secure Password</p>
                  <p className="text-sm font-bold text-emerald-400">You have successfully set your custom admin password.</p>
                  <p className="text-xs text-emerald-500/70 mt-2">
                    Use this password to log in to the Company Portal.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Link to="/company-login">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Go to Company Portal <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}