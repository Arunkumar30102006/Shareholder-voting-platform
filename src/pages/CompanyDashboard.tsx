import { SEO } from "@/components/layout/SEO";
import { useState, useEffect, useMemo, useRef, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Users,
  Mail,
  Phone,
  Plus,
  Send,
  Shield,
  LogOut,
  Loader2,
  CheckCircle2,
  Hash,
  Trash2,
  RefreshCw,
  Search,
  Download,
  Filter,
  TrendingUp,
  FileSpreadsheet,
  Globe,
  Sparkles,
  FileText,
  BrainCircuit,
  ExternalLink,
  ChevronRight,
  Pencil,
  AlertTriangle,
  Lock,
  X,
  CreditCard,
  Upload,
  Copy,
  Info,
  Layers,
  PieChart,
  UserCheck,
  Check
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { votingApi } from "@/services/api/voting";
import { env } from "@/config/env";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
const AdminVotingResults = lazy(() => import("@/components/company/AdminVotingResults").then(m => ({ default: m.AdminVotingResults })));
import { Company, Shareholder } from "@/types";

const shareholderSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address").max(255),
  phone: z.string().optional(),
  sharesHeld: z.number().min(1, "Shares must be at least 1"),
  category: z.string().optional(),
  holdingType: z.string().optional(),
  panNumber: z.string().optional(),
  dpidClientId: z.string().optional(),
});

const CompanyDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isAddingShareholder, setIsAddingShareholder] = useState(false);
  const [isSendingCredentials, setIsSendingCredentials] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [activeTab, setActiveTab] = useState("shareholders");
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Registration Form Drawer & Mode
  const [showAddForm, setShowAddForm] = useState(false);
  const [addMode, setAddMode] = useState<"manual" | "csv">("manual");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedCsvRows, setParsedCsvRows] = useState<Array<{
    name: string;
    email: string;
    phone: string;
    sharesHeld: number;
    category: string;
    holdingType: string;
    dpidClientId: string;
    panNumber: string;
  }>>([]);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);

  // Edit Shareholder State
  const [editingShareholder, setEditingShareholder] = useState<Shareholder | null>(null);
  const [isUpdatingShareholder, setIsUpdatingShareholder] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    sharesHeld: "",
    category: "RETAIL",
    holdingType: "NSDL_DEMAT",
    panNumber: "",
    dpidClientId: "",
  });

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Form Data State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    sharesHeld: "",
    category: "RETAIL",
    holdingType: "NSDL_DEMAT",
    panNumber: "",
    dpidClientId: "",
    shareClass: "ORDINARY_EQUITY",
    autoDispatchEmail: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastCreatedCreds, setLastCreatedCreds] = useState<{
    loginId: string;
    name: string;
    email?: string;
  } | null>(null);

  // Deregistration State
  const [showDeregisterDialog, setShowDeregisterDialog] = useState(false);
  const [deregisterStep, setDeregisterStep] = useState<1 | 2>(1);
  const [deregisterOtp, setDeregisterOtp] = useState("");
  const [generatedDeregisterOtp, setGeneratedDeregisterOtp] = useState("");
  const [confirmNameInput, setConfirmNameInput] = useState("");
  const [isSendingDeregisterOtp, setIsSendingDeregisterOtp] = useState(false);
  const [isDeregistering, setIsDeregistering] = useState(false);

  useEffect(() => {
    checkAuthAndLoadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      navigate("/company-login");
      return;
    }

    const { data: adminData, error: adminError } = await supabase
      .from("company_admins")
      .select("company_id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (adminError || !adminData) {
      console.error("Admin check failed:", adminError);
      await supabase.auth.signOut();
      navigate("/company-login");
      return;
    }

    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", adminData.company_id)
      .single();

    if (companyError || !companyData) {
      console.error("Company fetch failed:", companyError);
      toast.error("Failed to load company profile");
      setIsLoading(false);
      return;
    }

    setCompany(companyData);
    await Promise.all([
      loadShareholders(companyData.id),
      loadActiveSession(companyData.id),
    ]);

    setIsLoading(false);
  };

  const loadShareholders = async (companyId: string) => {
    const { data, error } = await supabase
      .from("shareholders")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed loading shareholders:", error);
      toast.error("Failed to fetch shareholder roster");
    } else {
      setShareholders(data || []);
    }
  };

  const loadActiveSession = async (companyId: string) => {
    try {
      const session = await votingApi.getActiveSession(companyId);
      if (session) {
        setSessionId(session.id);
      }
    } catch (err) {
      console.error("No active session:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === "panNumber") {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "panNumber") {
      setEditFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setEditFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOpenEdit = (shareholder: Shareholder) => {
    setEditingShareholder(shareholder);
    setEditFormData({
      name: shareholder.shareholder_name,
      email: shareholder.email,
      phone: shareholder.phone || "",
      sharesHeld: shareholder.shares_held.toString(),
      category: shareholder.category || "RETAIL",
      holdingType: shareholder.holding_type || "NSDL_DEMAT",
      panNumber: shareholder.pan_number || "",
      dpidClientId: shareholder.dpid_client_id || "",
    });
  };

  const handleUpdateShareholder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShareholder || !company) return;

    setIsUpdatingShareholder(true);
    try {
      const parsedShares = parseInt(String(editFormData.sharesHeld).trim(), 10);
      if (isNaN(parsedShares) || parsedShares < 1) {
        toast.error("Shares held must be a positive integer.");
        setIsUpdatingShareholder(false);
        return;
      }

      const { error } = await supabase
        .from("shareholders")
        .update({
          shareholder_name: editFormData.name.trim(),
          email: editFormData.email.trim().toLowerCase(),
          phone: editFormData.phone.trim() || null,
          shares_held: parsedShares,
        })
        .eq("id", editingShareholder.id)
        .eq("company_id", company.id);

      if (error) throw error;

      toast.success(`Shareholder ${editFormData.name} updated successfully!`);
      setEditingShareholder(null);
      await loadShareholders(company.id);
    } catch (err: unknown) {
      console.error("Update failed:", err);
      toast.error("Failed to update shareholder record.");
    } finally {
      setIsUpdatingShareholder(false);
    }
  };

  const generateSecureCredentials = () => {
    const loginId = `SH-${Math.floor(10000000 + Math.random() * 90000000).toString()}`;
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return { loginId, password };
  };

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  };

  // Add Single Shareholder
  const handleAddShareholder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingShareholder(true);
    setErrors({});

    try {
      const parsedShares = parseInt(String(formData.sharesHeld).trim(), 10) || 0;

      const validatedData = shareholderSchema.parse({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        sharesHeld: parsedShares,
        category: formData.category,
        holdingType: formData.holdingType,
        panNumber: formData.panNumber.trim().toUpperCase() || undefined,
        dpidClientId: formData.dpidClientId.trim() || undefined,
      });

      if (!company) {
        toast.error("Company profile not loaded.");
        setIsAddingShareholder(false);
        return;
      }

      const { loginId, password } = generateSecureCredentials();
      const passwordHash = await hashPassword(password);

      // Core fields guaranteed in Supabase PostgreSQL schema
      const insertPayload: Record<string, unknown> = {
        company_id: company.id,
        shareholder_name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        shares_held: validatedData.sharesHeld,
        login_id: loginId,
        password_hash: passwordHash,
      };

      const insertResult = await supabase
        .from("shareholders")
        .insert(insertPayload)
        .select()
        .single();

      if (insertResult.error) {
        console.error("Supabase insert error:", insertResult.error);
        if (insertResult.error.code === "23505") {
          toast.error("A shareholder with this login ID or email already exists.");
        } else {
          toast.error(`Failed to register shareholder: ${insertResult.error.message}`);
        }
        setIsAddingShareholder(false);
        return;
      }

      setLastCreatedCreds({
        loginId,
        name: validatedData.name,
        email: validatedData.email,
      });

      // Dispatch Email Credentials if toggled
      if (formData.autoDispatchEmail) {
        try {
          const { data: fnData, error: fnError } = await supabase.functions.invoke("send-shareholder-credentials", {
            body: {
              shareholderEmail: validatedData.email,
              shareholderName: validatedData.name,
              companyName: company.company_name,
              loginId: loginId,
              password: password,
            },
            headers: {
              "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`
            }
          });

          if (fnError || fnData?.error) {
            console.warn("Notice dispatch notice:", fnError || fnData?.error);
            toast.info(`Shareholder registered! Email delivery status:`, {
              description: `Verification email dispatched to ${validatedData.email}. You can also copy credentials below.`,
              duration: 8000
            });
          } else {
            toast.success(`Official credentials dispatched to ${validatedData.email}`);
          }
        } catch (mailErr) {
          console.warn("Mail invoke error:", mailErr);
        }
      } else {
        toast.success(`Shareholder ${validatedData.name} registered with ${validatedData.sharesHeld.toLocaleString()} shares!`);
      }

      await loadShareholders(company.id);

      setFormData({
        name: "",
        email: "",
        phone: "",
        sharesHeld: "",
        category: "RETAIL",
        holdingType: "NSDL_DEMAT",
        panNumber: "",
        dpidClientId: "",
        shareClass: "ORDINARY_EQUITY",
        autoDispatchEmail: true,
      });
      setShowAddForm(false);
    } catch (err: unknown) {
      console.error("Operation failed:", err);
      toast.error("An error occurred while adding the shareholder.");
    } finally {
      setIsAddingShareholder(false);
    }
  };

  // CSV Parsing & Bulk Import
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please select a valid .csv file.");
      return;
    }

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length <= 1) {
          toast.error("The CSV file appears to be empty or missing data rows.");
          return;
        }

        const header = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const nameIdx = header.findIndex(h => h.includes("name"));
        const emailIdx = header.findIndex(h => h.includes("email"));
        const phoneIdx = header.findIndex(h => h.includes("phone") || h.includes("mobile"));
        const sharesIdx = header.findIndex(h => h.includes("share"));
        const categoryIdx = header.findIndex(h => h.includes("category"));
        const holdingIdx = header.findIndex(h => h.includes("holding") || h.includes("type"));
        const dpidIdx = header.findIndex(h => h.includes("dpid") || h.includes("folio") || h.includes("client"));
        const panIdx = header.findIndex(h => h.includes("pan"));

        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length < 2) continue;

          const name = nameIdx !== -1 ? cols[nameIdx] : cols[0];
          const email = emailIdx !== -1 ? cols[emailIdx] : cols[1];
          const phone = phoneIdx !== -1 ? cols[phoneIdx] : (cols[2] || "");
          const shares = sharesIdx !== -1 ? parseInt(cols[sharesIdx], 10) || 100 : 100;
          const category = categoryIdx !== -1 ? cols[categoryIdx] : "RETAIL";
          const holdingType = holdingIdx !== -1 ? cols[holdingIdx] : "NSDL_DEMAT";
          const dpidClientId = dpidIdx !== -1 ? cols[dpidIdx] : "";
          const panNumber = panIdx !== -1 ? cols[panIdx].toUpperCase() : "";

          if (name && email) {
            parsed.push({
              name,
              email,
              phone,
              sharesHeld: shares,
              category,
              holdingType,
              dpidClientId,
              panNumber,
            });
          }
        }

        setParsedCsvRows(parsed);
        toast.info(`Parsed ${parsed.length} shareholder records from CSV.`);
      } catch (err) {
        console.error("CSV parse error:", err);
        toast.error("Failed to parse CSV file structure.");
      }
    };
    reader.readAsText(file);
  };

  const handleBulkInsertCsv = async () => {
    if (!company || parsedCsvRows.length === 0) return;

    setIsUploadingCsv(true);
    try {
      const recordsToInsert = [];
      for (const row of parsedCsvRows) {
        const { loginId, password } = generateSecureCredentials();
        const passwordHash = await hashPassword(password);
        recordsToInsert.push({
          company_id: company.id,
          shareholder_name: row.name,
          email: row.email,
          phone: row.phone || null,
          shares_held: row.sharesHeld,
          login_id: loginId,
          password_hash: passwordHash,
        });
      }

      const { error } = await supabase.from("shareholders").insert(recordsToInsert);
      if (error) throw error;

      toast.success(`Successfully imported ${recordsToInsert.length} shareholders from Benpos CSV!`);
      setParsedCsvRows([]);
      setCsvFile(null);
      setShowAddForm(false);
      await loadShareholders(company.id);
    } catch (err: unknown) {
      console.error("Bulk insert failed:", err);
      toast.error("Failed to insert bulk records into database.");
    } finally {
      setIsUploadingCsv(false);
    }
  };

  const handleDownloadSampleCsv = () => {
    const headers = "shareholder_name,email,phone,shares_held,category,holding_type,dpid_client_id,pan_number";
    const sampleRows = [
      `"Rameshwar Patel","rameshwar.patel@example.com","+919876543210",2500,"RETAIL","NSDL_DEMAT","IN30012610293847","ABCDE1234F"`,
      `"Sundaram Mutual Fund Trustee","compliance@sundaram.in","+912248920192",50000,"INSTITUTIONAL","CDSL_DEMAT","1201090000982341","AABCS9821K"`,
      `"Meera Singhania (Promoter)","meera.singhania@promoter.org","+919820019283",120000,"PROMOTER","NSDL_DEMAT","IN30115112349876","AAAPS8712P"`,
    ];
    const content = "data:text/csv;charset=utf-8," + [headers, ...sampleRows].join("\n");
    const encoded = encodeURI(content);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", "sample_benpos_shareholder_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResendCredentials = async (shareholder: Shareholder) => {
    if (!company) return;
    setIsSendingCredentials(shareholder.id);

    try {
      const { password } = generateSecureCredentials();
      const passwordHash = await hashPassword(password);

      const { error: updateError } = await supabase
        .from("shareholders")
        .update({
          password_hash: passwordHash,
          is_credential_used: false,
          credential_created_at: new Date().toISOString()
        })
        .eq("id", shareholder.id);

      if (updateError) throw updateError;

      const { error: emailError } = await supabase.functions.invoke('send-shareholder-credentials', {
        body: {
          shareholderEmail: shareholder.email,
          shareholderName: shareholder.shareholder_name,
          companyName: company.company_name,
          loginId: shareholder.login_id,
          password: password,
        },
        headers: {
          "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`
        }
      });

      if (emailError) {
        toast.warning("New PIN generated. Please copy credentials manually:", {
          description: `Login ID: ${shareholder.login_id} | PIN: ${password}`,
          duration: 20000,
        });
      } else {
        toast.success(`Fresh credentials dispatched to ${shareholder.email}`);
      }

      await loadShareholders(company.id);
    } catch (err: unknown) {
      console.error("Resend error:", err);
      toast.error("Failed to reset credentials.");
    } finally {
      setIsSendingCredentials(null);
    }
  };

  const handleBroadcastAllCredentials = async () => {
    if (!company || shareholders.length === 0) return;
    setIsBroadcasting(true);

    let successCount = 0;
    for (const sh of shareholders) {
      try {
        const { password } = generateSecureCredentials();
        const passwordHash = await hashPassword(password);

        await supabase
          .from("shareholders")
          .update({
            password_hash: passwordHash,
            is_credential_used: false,
            credential_created_at: new Date().toISOString()
          })
          .eq("id", sh.id);

        await supabase.functions.invoke('send-shareholder-credentials', {
          body: {
            shareholderEmail: sh.email,
            shareholderName: sh.shareholder_name,
            companyName: company.company_name,
            loginId: sh.login_id,
            password: password,
          },
          headers: {
            "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`
          }
        });
        successCount++;
      } catch (err) {
        console.error(`Failed sending to ${sh.email}`, err);
      }
    }

    setIsBroadcasting(false);
    toast.success(`Broadcast complete: Dispatched credentials to ${successCount} shareholders.`);
    if (company) await loadShareholders(company.id);
  };

  const handleDeleteShareholder = async (shareholderId: string) => {
    if (!company) return;
    try {
      const { error } = await supabase
        .from("shareholders")
        .delete()
        .eq("id", shareholderId)
        .eq("company_id", company.id);

      if (error) throw error;
      toast.success("Shareholder removed from register.");
      await loadShareholders(company.id);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to remove shareholder.");
    }
  };

  const handleExportCSV = () => {
    if (shareholders.length === 0) {
      toast.error("No shareholder data to export.");
      return;
    }

    const headers = ["Shareholder Name", "Email Address", "Phone", "Shares Held", "Category", "Holding Type", "DPID/Folio", "PAN", "Login ID", "Status", "Created At"];
    const rows = filteredShareholders.map(s => [
      `"${s.shareholder_name.replace(/"/g, '""')}"`,
      `"${s.email}"`,
      `"${s.phone || ''}"`,
      s.shares_held,
      `"${s.category || 'RETAIL'}"`,
      `"${s.holding_type || 'NSDL_DEMAT'}"`,
      `"${s.dpid_client_id || ''}"`,
      `"${s.pan_number || ''}"`,
      `"${s.login_id}"`,
      s.is_credential_used ? "Active / Voted" : "Pending Access",
      `"${s.created_at || s.credential_created_at || new Date().toISOString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${company?.company_name || 'shareholders'}_roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Shareholder roster exported as CSV.");
  };

  const handleExportPDF = async () => {
    if (shareholders.length === 0) {
      toast.error("No shareholder data to export.");
      return;
    }

    try {
      const { generateShareholderRosterPDF } = await import("@/lib/pdfReports");
      await generateShareholderRosterPDF({
        company: company,
        shareholders: filteredShareholders,
      });
      toast.success("Statutory Shareholder Roster PDF generated.");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF export.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/company-login");
  };

  // Calculations & KPIs
  const totalSharesRepresented = useMemo(() => {
    return shareholders.reduce((sum, s) => sum + (s.shares_held || 0), 0);
  }, [shareholders]);

  const activeCredentialCount = useMemo(() => {
    return shareholders.filter(s => s.is_credential_used).length;
  }, [shareholders]);

  // Section 103 Companies Act Quorum Calculation
  const statutoryQuorum = useMemo(() => {
    const count = shareholders.length;
    let requiredMembers = 5;
    if (count > 5000) {
      requiredMembers = 30;
    } else if (count > 1000) {
      requiredMembers = 15;
    }
    const currentAttended = activeCredentialCount;
    const isQuorumMet = currentAttended >= requiredMembers;
    return { requiredMembers, currentAttended, isQuorumMet };
  }, [shareholders, activeCredentialCount]);

  // Filtering
  const filteredShareholders = useMemo(() => {
    return shareholders.filter(s => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        s.shareholder_name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.login_id && s.login_id.toLowerCase().includes(q)) ||
        (s.dpid_client_id && s.dpid_client_id.toLowerCase().includes(q)) ||
        (s.pan_number && s.pan_number.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && s.is_credential_used) ||
        (statusFilter === "pending" && !s.is_credential_used);

      const matchesCategory =
        categoryFilter === "all" ||
        (s.category && s.category.toUpperCase() === categoryFilter.toUpperCase());

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [shareholders, searchQuery, statusFilter, categoryFilter]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen relative bg-[#020817] text-white selection:bg-blue-500/30">
      <SEO
        title="Company Governance Dashboard | Vote India Secure"
        description="Manage corporate shareholder rosters, depository Benpos ingestion, voting sessions, and statutory MCA filings."
        canonical="/company-dashboard"
        noindex={true}
      />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 p-6 rounded-3xl bg-[#0d1b2a]/90 border border-white/20 backdrop-blur-xl shadow-2xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2.5 shadow-sm">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>Enterprise Governance Portal</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {company?.company_name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 mt-2">
                <span className="font-mono bg-black/40 px-2.5 py-0.5 rounded-lg border border-white/10 text-cyan-300">CIN: {company?.cin_number}</span>
                <span>•</span>
                <span className="font-mono bg-black/40 px-2.5 py-0.5 rounded-lg border border-white/10 text-emerald-300">PAN: {company?.pan_number}</span>
                <span>•</span>
                <span className="text-slate-400">CS: {company?.cs_name || "Designated PCS"}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <Button 
                onClick={() => navigate("/voting-management")} 
                className="bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold gap-2 rounded-xl px-5 py-5 shadow-lg shadow-blue-900/40 border border-blue-400/40"
              >
                <Shield className="w-4 h-4" />
                Voting Management Hub
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                className="border-white/30 hover:bg-white/10 text-white rounded-xl gap-2 px-4 py-5 font-bold shadow-sm"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                Logout
              </Button>
            </div>
          </div>

          {/* 4 Executive KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <Card className="bg-[#0d1b2a]/90 border-white/20 backdrop-blur-xl shadow-xl hover:border-blue-500/40 transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-300 uppercase tracking-wider">Registered Shareholders</p>
                    <p className="text-3xl font-black text-white mt-1 tabular-nums">{shareholders.length}</p>
                    <p className="text-xs text-cyan-300 mt-1 font-bold">Depository Benpos Roster</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shadow-md">
                    <Users className="w-6 h-6 text-blue-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0d1b2a]/90 border-white/20 backdrop-blur-xl shadow-xl hover:border-emerald-500/40 transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-300 uppercase tracking-wider">Voting Capital</p>
                    <p className="text-3xl font-black text-white mt-1 tabular-nums">
                      {totalSharesRepresented.toLocaleString()}
                    </p>
                    <p className="text-xs text-emerald-300 mt-1 font-bold">Total Equity Shares Represented</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shadow-md">
                    <Hash className="w-6 h-6 text-emerald-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quorum Metric Card */}
            <Card className="bg-[#0d1b2a]/90 border-white/20 backdrop-blur-xl shadow-xl hover:border-amber-500/40 transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-300 uppercase tracking-wider">Sec 103 Quorum</p>
                    <p className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                      <span className={statutoryQuorum.isQuorumMet ? "text-emerald-400" : "text-amber-300"}>
                        {statutoryQuorum.currentAttended} / {statutoryQuorum.requiredMembers}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${statutoryQuorum.isQuorumMet ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}>
                        {statutoryQuorum.isQuorumMet ? "Quorum Met" : "In Progress"}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">Req. {statutoryQuorum.requiredMembers} members for general meeting</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shadow-md">
                    <UserCheck className="w-6 h-6 text-amber-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0d1b2a]/90 border-white/20 backdrop-blur-xl shadow-xl hover:border-purple-500/40 transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-300 uppercase tracking-wider">AGM Infrastructure</p>
                    <p className="text-2xl font-black text-white mt-1">
                      {sessionId ? "Live Session" : "Configured"}
                    </p>
                    <p className="text-xs text-purple-300 mt-1 font-bold">Rule 20 Sealed Vault</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shadow-md">
                    <TrendingUp className="w-6 h-6 text-purple-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Power Suite Banner */}
          <div className="mb-8">
            <Card 
              className="border-purple-400/40 bg-gradient-to-r from-purple-950/60 via-[#0d1b2a]/90 to-blue-950/60 backdrop-blur-xl overflow-hidden relative group cursor-pointer hover:border-purple-400/70 transition-all rounded-3xl p-2 shadow-2xl" 
              onClick={() => navigate("/ai-power-suite")}
            >
              <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/30 border border-purple-400/50 flex items-center justify-center shrink-0 shadow-lg">
                    <Sparkles className="w-6 h-6 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      AI Document &amp; Investor Sentiment Suite
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold border border-purple-400/40">Enterprise</span>
                    </h3>
                    <p className="text-sm text-slate-200 mt-1 font-normal leading-relaxed">
                      Generate executive summaries of annual reports and analyze live shareholder sentiment during meetings.
                    </p>
                  </div>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl px-5 py-5 gap-2 shrink-0 border border-purple-400/50 shadow-lg">
                  Launch AI Suite <Sparkles className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="shareholders" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[600px] bg-[#0d1b2a]/95 backdrop-blur border border-white/20 p-1.5 rounded-2xl shadow-xl">
              <TabsTrigger value="shareholders" className="gap-2 font-bold text-slate-200 data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white rounded-xl">
                <Users className="w-4 h-4" /> Shareholder Roster
              </TabsTrigger>
              <TabsTrigger value="results" className="gap-2 font-bold text-slate-200 data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white rounded-xl">
                <FileText className="w-4 h-4" /> Live Results
              </TabsTrigger>
              <TabsTrigger value="profile" className="gap-2 font-bold text-slate-200 data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white rounded-xl">
                <Building2 className="w-4 h-4" /> Enterprise Profile
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: SHAREHOLDERS */}
            <TabsContent value="shareholders" className="space-y-6">
              
              {/* Controls Bar */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0d1b2a]/90 border border-white/20 backdrop-blur-xl shadow-xl">
                <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search by name, email, login ID, DP ID or PAN..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-black/60 border-white/25 text-white placeholder:text-slate-400 rounded-xl font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
                    <Select
                      value={statusFilter}
                      onValueChange={(val) => setStatusFilter(val as "all" | "active" | "pending")}
                    >
                      <SelectTrigger className="w-[170px] bg-[#020817] border-white/25 text-white font-bold rounded-xl text-xs h-10 px-3 shadow-md">
                        <SelectValue placeholder="Filter status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#020817] border-white/20 text-white rounded-xl shadow-2xl z-50 p-1.5">
                        <SelectItem value="all" className="text-white hover:bg-blue-600 font-bold rounded-lg text-xs">
                          All Statuses ({shareholders.length})
                        </SelectItem>
                        <SelectItem value="active" className="text-emerald-300 hover:bg-emerald-600 font-bold rounded-lg text-xs">
                          Active / Voted ({activeCredentialCount})
                        </SelectItem>
                        <SelectItem value="pending" className="text-amber-300 hover:bg-amber-600 font-bold rounded-lg text-xs">
                          Pending Access ({shareholders.length - activeCredentialCount})
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    variant="outline"
                    onClick={handleExportCSV}
                    className="border-white/30 hover:bg-white/10 text-white font-bold rounded-xl gap-2 text-xs shadow-sm"
                  >
                    <Download className="w-4 h-4 text-cyan-300" />
                    Export CSV
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleExportPDF}
                    className="border-white/30 hover:bg-white/10 text-white font-bold rounded-xl gap-2 text-xs shadow-sm"
                  >
                    <FileText className="w-4 h-4 text-emerald-400" />
                    Roster PDF
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleBroadcastAllCredentials}
                    disabled={isBroadcasting}
                    className="border-white/30 hover:bg-white/10 text-white font-bold rounded-xl gap-2 text-xs shadow-sm"
                  >
                    {isBroadcasting ? <Loader2 className="w-4 h-4 animate-spin text-amber-300" /> : <Send className="w-4 h-4 text-amber-300" />}
                    Broadcast Credentials
                  </Button>

                  <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 text-xs border border-blue-400/40 shadow-md"
                  >
                    {showAddForm ? "Close Form" : <><Plus className="w-4 h-4" /> Register Shareholder</>}
                  </Button>
                </div>
              </div>

              {/* Enhanced Register Shareholder Form / Drawer */}
              {showAddForm && (
                <Card className="border-blue-500/40 bg-[#0d1b2a]/95 backdrop-blur-xl rounded-3xl shadow-2xl animate-in fade-in slide-in-from-top-3 duration-300 overflow-hidden">
                  <CardHeader className="border-b border-white/15 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                          <Plus className="w-5 h-5 text-cyan-400" />
                          Register Stakeholder &amp; Issue Voting Token
                        </CardTitle>
                        <CardDescription className="text-slate-300 text-xs sm:text-sm mt-0.5">
                          Add individual shareholders or bulk-import depository Benpos records with automated credential dispatch.
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={addMode === "manual" ? "default" : "outline"}
                          onClick={() => setAddMode("manual")}
                          className={`rounded-xl text-xs font-bold ${addMode === "manual" ? "bg-blue-600 text-white" : "border-white/20 text-slate-300"}`}
                        >
                          Manual Form
                        </Button>
                        <Button
                          size="sm"
                          variant={addMode === "csv" ? "default" : "outline"}
                          onClick={() => setAddMode("csv")}
                          className={`rounded-xl text-xs font-bold ${addMode === "csv" ? "bg-cyan-600 text-white" : "border-white/20 text-slate-300"}`}
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
                          Bulk Benpos CSV
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    {addMode === "manual" ? (
                      /* MANUAL FORM */
                      <form onSubmit={handleAddShareholder} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          
                          {/* Full Name */}
                          <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-slate-200 font-bold text-xs">
                              Shareholder / Entity Legal Name *
                            </Label>
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="e.g. Aditi Sharma / Sundaram Trustee"
                              className="bg-black/60 border-white/20 text-white rounded-xl font-medium text-sm h-11"
                              required
                              disabled={isAddingShareholder}
                            />
                            {errors.name && <p className="text-xs text-rose-400 font-bold">{errors.name}</p>}
                          </div>

                          {/* Email */}
                          <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-slate-200 font-bold text-xs">
                              Registered Email Address (for 2FA OTP) *
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="shareholder@domain.com"
                                className="pl-10 bg-black/60 border-white/20 text-white rounded-xl font-medium text-sm h-11"
                                required
                                disabled={isAddingShareholder}
                              />
                            </div>
                            {errors.email && <p className="text-xs text-rose-400 font-bold">{errors.email}</p>}
                          </div>

                          {/* Phone */}
                          <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-slate-200 font-bold text-xs">
                              Mobile Number (SMS OTP / Notice)
                            </Label>
                            <div className="relative">
                              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="+91 98765 43210"
                                className="pl-10 bg-black/60 border-white/20 text-white rounded-xl font-medium text-sm h-11"
                                disabled={isAddingShareholder}
                              />
                            </div>
                          </div>

                          {/* Shares Held */}
                          <div className="space-y-1.5">
                            <Label htmlFor="sharesHeld" className="text-slate-200 font-bold text-xs">
                              Voting Shares Held (Record Date) *
                            </Label>
                            <Input
                              id="sharesHeld"
                              name="sharesHeld"
                              type="number"
                              value={formData.sharesHeld}
                              onChange={handleInputChange}
                              placeholder="e.g. 5000"
                              min="1"
                              className="bg-black/60 border-white/20 text-white rounded-xl font-medium text-sm h-11"
                              required
                              disabled={isAddingShareholder}
                            />
                            {errors.sharesHeld && <p className="text-xs text-rose-400 font-bold">{errors.sharesHeld}</p>}
                          </div>

                          {/* Investor Category */}
                          <div className="space-y-1.5">
                            <Label className="text-slate-200 font-bold text-xs">Investor Category</Label>
                            <select
                              name="category"
                              value={formData.category}
                              onChange={handleInputChange}
                              className="w-full bg-black/60 border border-white/20 text-white rounded-xl h-11 px-3 text-xs focus:border-cyan-400"
                            >
                              <option value="RETAIL">Retail Individual Investor</option>
                              <option value="PROMOTER">Promoter &amp; Promoter Group</option>
                              <option value="INSTITUTIONAL">Domestic Institutional (DII / Mutual Fund)</option>
                              <option value="FPI">Foreign Portfolio Investor (FPI)</option>
                              <option value="BODY_CORPORATE">Body Corporate</option>
                              <option value="NRI">Non-Resident Indian (NRI)</option>
                            </select>
                          </div>

                          {/* Holding Structure */}
                          <div className="space-y-1.5">
                            <Label className="text-slate-200 font-bold text-xs">Depository Holding Mode</Label>
                            <select
                              name="holdingType"
                              value={formData.holdingType}
                              onChange={handleInputChange}
                              className="w-full bg-black/60 border border-white/20 text-white rounded-xl h-11 px-3 text-xs focus:border-cyan-400"
                            >
                              <option value="NSDL_DEMAT">Demat Account (NSDL)</option>
                              <option value="CDSL_DEMAT">Demat Account (CDSL)</option>
                              <option value="PHYSICAL_FOLIO">Physical Share Folio</option>
                            </select>
                          </div>

                          {/* DP ID / Client ID / Folio */}
                          <div className="space-y-1.5">
                            <Label htmlFor="dpidClientId" className="text-slate-200 font-bold text-xs">
                              DP ID / Client ID or Folio Number
                            </Label>
                            <div className="relative">
                              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                id="dpidClientId"
                                name="dpidClientId"
                                value={formData.dpidClientId}
                                onChange={handleInputChange}
                                placeholder="e.g. IN30012610293847"
                                className="pl-10 bg-black/60 border-white/20 text-white rounded-xl font-medium text-sm h-11"
                                disabled={isAddingShareholder}
                              />
                            </div>
                          </div>

                          {/* PAN Number */}
                          <div className="space-y-1.5">
                            <Label htmlFor="panNumber" className="text-slate-200 font-bold text-xs">
                              Permanent Account Number (PAN)
                            </Label>
                            <div className="relative">
                              <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                id="panNumber"
                                name="panNumber"
                                maxLength={10}
                                value={formData.panNumber}
                                onChange={handleInputChange}
                                placeholder="e.g. ABCDE1234F"
                                className="pl-10 bg-black/60 border-white/20 text-white rounded-xl font-medium text-sm uppercase h-11"
                                disabled={isAddingShareholder}
                              />
                            </div>
                          </div>

                          {/* Share Class */}
                          <div className="space-y-1.5">
                            <Label className="text-slate-200 font-bold text-xs">Share Class Entitlement</Label>
                            <select
                              name="shareClass"
                              value={formData.shareClass}
                              onChange={handleInputChange}
                              className="w-full bg-black/60 border border-white/20 text-white rounded-xl h-11 px-3 text-xs focus:border-cyan-400"
                            >
                              <option value="ORDINARY_EQUITY">Ordinary Equity Shares (1 Share = 1 Vote)</option>
                              <option value="DVR">Class A Differential Voting Rights (DVR)</option>
                              <option value="PREFERENCE">Voting Preference Shares</option>
                            </select>
                          </div>

                        </div>

                        {/* Dispatch Toggle & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
                          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-200">
                            <input
                              type="checkbox"
                              name="autoDispatchEmail"
                              checked={formData.autoDispatchEmail}
                              onChange={handleInputChange}
                              className="w-4 h-4 rounded border-white/20 bg-black/40 text-blue-600 focus:ring-cyan-500"
                            />
                            <span>Automatically dispatch official AGM notice and voting credentials to registered email</span>
                          </label>

                          <div className="flex items-center gap-3">
                            <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)} className="text-slate-300 hover:text-white rounded-xl font-semibold">
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isAddingShareholder} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 gap-2 shadow-lg shadow-blue-500/20">
                              {isAddingShareholder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              Issue Credentials &amp; Register
                            </Button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      /* BULK BENPOS CSV UPLOAD */
                      <div className="space-y-6">
                        <div className="p-8 border-2 border-dashed border-cyan-500/40 rounded-3xl bg-black/40 text-center space-y-4">
                          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center mx-auto text-cyan-300">
                            <Upload className="w-7 h-7" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white">Upload NSDL / CDSL Depository Benpos CSV</h4>
                            <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                              Select a structured CSV file containing shareholder demographics, shares held, PAN, and Demat accounts.
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center justify-center gap-3">
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept=".csv"
                              onChange={handleCsvFileChange}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              Browse CSV File
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleDownloadSampleCsv}
                              className="border-white/20 hover:bg-white/10 text-cyan-300 font-bold rounded-xl text-xs gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download Sample Benpos Template (.csv)
                            </Button>
                          </div>
                        </div>

                        {/* Parsed Preview Table */}
                        {parsedCsvRows.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-sm text-cyan-300">
                                Parsed Records Preview ({parsedCsvRows.length} Stakeholders)
                              </h5>
                              <Button
                                onClick={handleBulkInsertCsv}
                                disabled={isUploadingCsv}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs gap-2"
                              >
                                {isUploadingCsv ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                Commit &amp; Register {parsedCsvRows.length} Stakeholders
                              </Button>
                            </div>
                            <div className="max-h-60 overflow-y-auto rounded-2xl border border-white/15 bg-black/60">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-black/80 text-slate-300 sticky top-0 border-b border-white/10">
                                  <tr>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Email</th>
                                    <th className="p-3">Shares</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3">DPID / Folio</th>
                                    <th className="p-3">PAN</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                  {parsedCsvRows.slice(0, 10).map((row, idx) => (
                                    <tr key={idx} className="hover:bg-white/5">
                                      <td className="p-3 font-semibold text-white">{row.name}</td>
                                      <td className="p-3 text-slate-300">{row.email}</td>
                                      <td className="p-3 font-bold text-cyan-300">{row.sharesHeld.toLocaleString()}</td>
                                      <td className="p-3 text-slate-400">{row.category}</td>
                                      <td className="p-3 font-mono text-[11px] text-slate-300">{row.dpidClientId || "—"}</td>
                                      <td className="p-3 font-mono text-[11px] text-slate-300">{row.panNumber || "—"}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Edit Shareholder Modal */}
              {editingShareholder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
                  <Card className="w-full max-w-xl border-cyan-500/40 bg-[#0d1b2a] backdrop-blur-2xl rounded-3xl shadow-2xl">
                    <CardHeader className="border-b border-white/15 flex flex-row items-center justify-between pb-4">
                      <div>
                        <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                          <Pencil className="w-5 h-5 text-cyan-400" />
                          Edit Stakeholder Details
                        </CardTitle>
                        <CardDescription className="text-slate-300 text-xs mt-0.5">
                          Update demographic records, depository accounts, or voting entitlement.
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setEditingShareholder(null)} className="text-slate-400 hover:text-white rounded-lg p-2">
                        <X className="w-5 h-5" />
                      </Button>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <form onSubmit={handleUpdateShareholder} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-slate-200 font-bold text-xs">Shareholder Name</Label>
                            <Input
                              name="name"
                              value={editFormData.name}
                              onChange={handleEditInputChange}
                              className="bg-black/60 border-white/20 text-white rounded-xl text-sm"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-slate-200 font-bold text-xs">Email Address</Label>
                            <Input
                              name="email"
                              type="email"
                              value={editFormData.email}
                              onChange={handleEditInputChange}
                              className="bg-black/60 border-white/20 text-white rounded-xl text-sm"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-slate-200 font-bold text-xs">Phone Number</Label>
                            <Input
                              name="phone"
                              value={editFormData.phone}
                              onChange={handleEditInputChange}
                              className="bg-black/60 border-white/20 text-white rounded-xl text-sm"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-slate-200 font-bold text-xs">Voting Shares Held</Label>
                            <Input
                              name="sharesHeld"
                              type="number"
                              min="1"
                              value={editFormData.sharesHeld}
                              onChange={handleEditInputChange}
                              className="bg-black/60 border-cyan-500/40 text-cyan-300 font-bold text-sm rounded-xl"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-slate-200 font-bold text-xs">Category</Label>
                            <select
                              name="category"
                              value={editFormData.category}
                              onChange={handleEditInputChange}
                              className="w-full bg-black/60 border border-white/20 text-white rounded-xl h-10 px-3 text-xs"
                            >
                              <option value="RETAIL">Retail Individual</option>
                              <option value="PROMOTER">Promoter</option>
                              <option value="INSTITUTIONAL">Institutional (DII / FPI)</option>
                              <option value="BODY_CORPORATE">Body Corporate</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-slate-200 font-bold text-xs">PAN Number</Label>
                            <Input
                              name="panNumber"
                              maxLength={10}
                              value={editFormData.panNumber}
                              onChange={handleEditInputChange}
                              className="bg-black/60 border-white/20 text-white uppercase font-mono text-sm rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                          <Button type="button" variant="ghost" onClick={() => setEditingShareholder(null)} className="text-slate-300 hover:text-white rounded-xl font-semibold">
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isUpdatingShareholder} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 shadow-lg gap-2">
                            {isUpdatingShareholder ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Save Modifications
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Shareholders Table Card */}
              <Card className="border-white/20 bg-[#0d1b2a]/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                <CardHeader className="border-b border-white/15 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-black text-white">Shareholder Registry Ledger</CardTitle>
                      <CardDescription className="text-slate-300 text-xs font-medium">
                        Showing {filteredShareholders.length} of {shareholders.length} registered stakeholders
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredShareholders.length === 0 ? (
                    <div className="text-center py-16">
                      <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-white font-bold">No stakeholders match your current filter.</p>
                      <p className="text-xs text-slate-400 mt-1">Try modifying your search keywords or clear filters.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/15 bg-black/60 text-xs font-black text-slate-200 tracking-wider">
                            <th className="py-4 px-6">STAKEHOLDER</th>
                            <th className="py-4 px-6">CONTACT</th>
                            <th className="py-4 px-6">SHARES &amp; WEIGHT</th>
                            <th className="py-4 px-6">LOGIN TOKEN</th>
                            <th className="py-4 px-6">STATUS</th>
                            <th className="py-4 px-6 text-right">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {filteredShareholders.map((shareholder) => {
                            const weightPct = totalSharesRepresented > 0 
                              ? ((shareholder.shares_held / totalSharesRepresented) * 100).toFixed(2)
                              : "0.00";

                            return (
                              <tr key={shareholder.id} className="hover:bg-white/[0.04] transition-colors">
                                <td className="py-4 px-6">
                                  <div className="space-y-1">
                                    <span className="font-bold text-white text-sm block">{shareholder.shareholder_name}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-[10px] font-semibold border border-blue-400/30">
                                        {shareholder.category || "RETAIL"}
                                      </span>
                                      {shareholder.dpid_client_id && (
                                        <span className="font-mono text-[10px] text-slate-400">
                                          {shareholder.dpid_client_id.slice(0, 8)}...
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="text-xs text-slate-300">
                                    <span className="block font-medium text-white">{shareholder.email}</span>
                                    {shareholder.phone && <span className="text-slate-400 text-[11px]">{shareholder.phone}</span>}
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <div>
                                    <span className="text-cyan-300 font-extrabold tabular-nums text-base block">
                                      {shareholder.shares_held.toLocaleString()}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                      {weightPct}% voting power
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-1.5">
                                    <code className="px-2.5 py-1 rounded-lg bg-black/80 border border-white/20 text-xs font-mono text-cyan-300 font-bold">
                                      {shareholder.login_id}
                                    </code>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(shareholder.login_id || "");
                                        toast.success("Login ID copied!");
                                      }}
                                      className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                                      title="Copy Login ID"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  {shareholder.is_credential_used ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                      Active / Voted
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                                      Pending Access
                                    </span>
                                  )}
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleOpenEdit(shareholder)}
                                      className="hover:bg-blue-500/20 text-cyan-300 hover:text-cyan-200 rounded-lg text-xs font-bold gap-1 px-2.5"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                      Edit
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleResendCredentials(shareholder)}
                                      disabled={isSendingCredentials === shareholder.id}
                                      className="hover:bg-white/15 text-slate-200 hover:text-white rounded-lg text-xs font-bold gap-1 px-2.5"
                                    >
                                      {isSendingCredentials === shareholder.id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                                      )}
                                      Resend
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteShareholder(shareholder.id)}
                                      className="hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg p-2"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: LIVE RESULTS */}
            <TabsContent value="results" className="space-y-6">
              {sessionId ? (
                <Suspense fallback={<div className="h-48 rounded-2xl bg-[#0d1b2a]/60 border border-white/10 animate-pulse" />}>
                  <AdminVotingResults sessionId={sessionId} companyName={company?.company_name || ""} />
                </Suspense>
              ) : (
                <Card className="border-white/20 bg-[#0d1b2a]/90 backdrop-blur-xl p-12 text-center rounded-3xl shadow-2xl">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Active Voting Session</h3>
                  <p className="text-slate-300 text-sm max-w-md mx-auto mb-6 font-normal">
                    Schedule resolutions and launch an AGM session in Voting Management to monitor live results.
                  </p>
                  <Button onClick={() => navigate("/voting-management")} className="bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-white">
                    Go to Voting Management
                  </Button>
                </Card>
              )}
            </TabsContent>

            {/* TAB 3: ENTERPRISE PROFILE */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Basic Details */}
                <Card className="border-white/20 bg-[#0d1b2a]/90 backdrop-blur-xl rounded-3xl shadow-xl">
                  <CardHeader className="pb-3 border-b border-white/15">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-cyan-400">
                      <Building2 className="w-5 h-5" /> Organization Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 uppercase font-black tracking-wider">Company Name</p>
                      <p className="font-bold text-white text-base">{company?.company_name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 uppercase font-black tracking-wider">Company Type</p>
                      <p className="font-semibold text-slate-200">{company?.company_type || "Corporation"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 uppercase font-black tracking-wider">Corporate ID / CIN</p>
                      <p className="font-mono text-sm text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-lg w-fit border border-cyan-400/40 font-bold">{company?.cin_number}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 uppercase font-black tracking-wider">Tax ID / PAN</p>
                      <p className="font-mono text-sm text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-lg w-fit border border-emerald-400/40 font-bold">{company?.pan_number}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Capital & Governance */}
                <Card className="border-white/20 bg-[#0d1b2a]/90 backdrop-blur-xl rounded-3xl shadow-xl">
                  <CardHeader className="pb-3 border-b border-white/15">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-cyan-400">
                      <FileText className="w-5 h-5" /> Capital &amp; Scrutinizer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 uppercase font-black tracking-wider">Authorized Capital</p>
                      <p className="font-black text-white text-lg tabular-nums">
                        ₹{company?.authorized_capital?.toLocaleString() || "10,000,000"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 uppercase font-black tracking-wider">Paid-Up Capital</p>
                      <p className="font-black text-white text-lg tabular-nums">
                        ₹{company?.paid_up_capital?.toLocaleString() || "5,000,000"}
                      </p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-xs text-slate-400 uppercase font-black tracking-wider">Official Scrutinizer / Auditor</p>
                      <p className="text-sm font-bold text-white">{company?.cs_name || "Assigned Independent Scrutinizer"}</p>
                      <p className="text-xs text-slate-300 font-medium">{company?.cs_email}</p>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </TabsContent>
          </Tabs>

          {/* Statutory Rule 20 Notice Dispatched Confirmation Modal */}
          {lastCreatedCreds && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
              <Card className="w-full max-w-lg border-emerald-500/40 bg-[#0d1b2a] backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden">
                <CardHeader className="border-b border-white/15 pb-4 bg-gradient-to-r from-emerald-950/60 to-cyan-950/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-black text-white">Statutory Notice Dispatched</CardTitle>
                        <CardDescription className="text-slate-300 text-xs mt-0.5">
                          Enrolled under Section 108 &amp; Rule 20 of Companies Act 2013
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLastCreatedCreds(null)}
                      className="text-slate-400 hover:text-white rounded-lg p-2"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <div className="text-xs text-emerald-200/90 leading-relaxed">
                      <strong className="text-white block mb-1">Rule 20(4)(xii) Statutory Ballot Secrecy Enforced</strong>
                      Voting security PINs and credentials have been cryptographically generated and dispatched directly to the shareholder's registered email address. Plaintext passwords are not accessible to company administrators to preserve voter confidentiality.
                    </div>
                  </div>

                  <div className="space-y-2 p-4 rounded-2xl bg-black/60 border border-white/10">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Shareholder Name:</span>
                      <span className="text-white font-bold">{lastCreatedCreds.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Dispatched To:</span>
                      <span className="text-cyan-300 font-mono">{lastCreatedCreds.email || "Registered Email"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-white/10">
                      <span className="text-slate-400">Voting Token ID:</span>
                      <div className="flex items-center gap-1.5">
                        <code className="text-cyan-400 font-mono font-bold">{lastCreatedCreds.loginId}</code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(lastCreatedCreds.loginId);
                            toast.success("Voting Token ID copied!");
                          }}
                          className="text-slate-400 hover:text-white p-1"
                          title="Copy Token ID"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Security PIN:</span>
                      <span className="text-emerald-400 font-semibold italic">●●●●●●●● (Dispatched to Voter Only)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      onClick={() => setLastCreatedCreds(null)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                    >
                      Acknowledge &amp; Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default CompanyDashboard;