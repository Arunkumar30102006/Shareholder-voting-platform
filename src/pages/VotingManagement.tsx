/* eslint-disable @typescript-eslint/no-explicit-any */
import { SEO } from "@/components/layout/SEO";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CalendarDays,
  Users,
  UserPlus,
  Video,
  Link as LinkIcon,
  Send,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  FileText,
  Mail,
  Loader2,
  Plus,
  Trash2,
  Vote,
  Shield,
  Info,
  ExternalLink,
  Trophy,
  Download,
  Sparkles,
  Layers,
  FileCheck2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { env } from "@/config/env";
import { z } from "zod";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { MerkleTree } from "@/lib/merkle";
import { simulateBlockchainTransaction } from "@/lib/blockchain";
import { Nominee, VotingSession, ResolutionResult, AnchorData, Company, Shareholder, Resolution, EventType, EgmRequisitionType, EventStatus } from "@/types";

const resolutionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(250),
  description: z.string().min(5, "Description must be at least 5 characters").max(1000),
  resolutionType: z.enum(["ordinary", "special", "unanimous"]),
});

const nomineeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address").max(255),
  designation: z.string().optional(),
  qualification: z.string().optional(),
  experienceYears: z.number().min(0).optional(),
  bio: z.string().max(500).optional(),
});

const sessionSchema = z.object({
  eventType: z.enum(["AGM", "EGM", "GENERAL_MEETING", "POSTAL_BALLOT"]),
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().optional(),
  startDate: z.string().min(1, "Voting start date is required"),
  endDate: z.string().min(1, "Voting end date is required"),
  meetingDate: z.string().optional(),
  meetingEndDate: z.string().optional(),
  noticeDate: z.string().optional(),
  meetingLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  meetingPassword: z.string().optional(),
  meetingPlatform: z.string().optional(),
  votingInstructions: z.string().optional(),
  recordDate: z.string().min(1, "Record date is required"),
  egmRequisitionType: z.enum(["BOARD_CONVENED", "MEMBER_REQUISITION_SEC_100", "NCLT_DIRECTED"]).optional(),
  isShortNotice: z.boolean().optional(),
  explanatoryStatementReference: z.string().optional(),
  egmReason: z.string().optional(),
});

const VotingManagement = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [allSessions, setAllSessions] = useState<VotingSession[]>([]);
  const [votingSession, setVotingSession] = useState<VotingSession | null>(null);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Forms toggle
  const [showAddResolution, setShowAddResolution] = useState(false);
  const [isAddingResolution, setIsAddingResolution] = useState(false);
  const [showAddNominee, setShowAddNominee] = useState(false);
  const [isAddingNominee, setIsAddingNominee] = useState(false);

  const [sessionForm, setSessionForm] = useState({
    eventType: "AGM" as EventType,
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    meetingLink: "",
    meetingPassword: "",
    meetingPlatform: "zoom",
    meetingDate: "",
    meetingEndDate: "",
    noticeDate: "",
    votingInstructions: "",
    recordDate: "",
    egmRequisitionType: "BOARD_CONVENED" as EgmRequisitionType,
    isShortNotice: false,
    explanatoryStatementReference: "",
    egmReason: "",
  });

  const [resolutionForm, setResolutionForm] = useState({
    title: "",
    description: "",
    resolutionType: "ordinary" as "ordinary" | "special" | "unanimous",
  });

  const [nomineeForm, setNomineeForm] = useState({
    name: "",
    email: "",
    designation: "",
    qualification: "",
    experienceYears: "",
    bio: "",
  });

  const [results, setResults] = useState<ResolutionResult[]>([]);
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [anchorData, setAnchorData] = useState<AnchorData | null>(null);

  const checkAuthAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      navigate("/company-login");
      return;
    }

    const { data: adminData, error: adminError } = await (supabase
      .from("company_admins") as any)
      .select("company_id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (adminError || !adminData) {
      toast.error("Access denied. Not a company administrator.");
      navigate("/company-login");
      return;
    }

    const { data: companyData, error: companyError } = await (supabase
      .from("companies") as any)
      .select("*")
      .eq("id", adminData.company_id)
      .maybeSingle();

    if (companyError || !companyData) {
      toast.error("Could not load company data");
      setIsLoading(false);
      return;
    }

    setCompany(companyData as Company);
    await loadVotingSessions(companyData.id);
    await loadShareholders(companyData.id);
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuthAndLoadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

const toLocalInputString = (isoString?: string | null) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
};

const toLocalDateString = (dateOrIso?: string | null) => {
  if (!dateOrIso) return "";
  try {
    const d = new Date(dateOrIso);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  } catch {
    return "";
  }
};

  const loadVotingSessions = async (companyId: string, targetSessionId?: string) => {
    const { data, error } = await supabase
      .from("voting_sessions")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading voting sessions:", error);
      return;
    }

    if (data && data.length > 0) {
      const typedSessions = data as unknown as VotingSession[];
      setAllSessions(typedSessions);
      const selected = targetSessionId 
        ? (typedSessions.find(s => s.id === targetSessionId) || typedSessions[0])
        : (votingSession ? (typedSessions.find(s => s.id === votingSession.id) || typedSessions[0]) : typedSessions[0]);

      setVotingSession(selected);
      setSessionForm({
        eventType: (selected.event_type as EventType) || "AGM",
        title: selected.title || "",
        description: selected.description || "",
        startDate: toLocalInputString(selected.voting_start || selected.start_date),
        endDate: toLocalInputString(selected.voting_end || selected.end_date),
        meetingDate: toLocalInputString(selected.meeting_date || (selected as unknown as { meeting_start_date?: string }).meeting_start_date),
        meetingEndDate: toLocalInputString(selected.meeting_end_date),
        noticeDate: toLocalDateString(selected.notice_date),
        meetingLink: selected.meeting_link || "",
        meetingPassword: selected.meeting_password || "",
        meetingPlatform: selected.meeting_platform || "zoom",
        votingInstructions: selected.voting_instructions || "",
        recordDate: toLocalDateString(selected.record_date),
        egmRequisitionType: (selected.egm_requisition_type as EgmRequisitionType) || "BOARD_CONVENED",
        isShortNotice: !!selected.is_short_notice,
        explanatoryStatementReference: selected.explanatory_statement_reference || "",
        egmReason: selected.egm_reason || "",
      });

      await loadResolutions(selected.id);
      await loadNominees(selected.id);
      await loadResults(selected.id);
    } else {
      setAllSessions([]);
      setVotingSession(null);
    }
  };

  const handleNewSession = () => {
    setVotingSession(null);
    setSessionForm({
      eventType: "AGM",
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      meetingDate: "",
      meetingEndDate: "",
      noticeDate: "",
      meetingLink: "",
      meetingPassword: "",
      meetingPlatform: "zoom",
      votingInstructions: "",
      recordDate: "",
      egmRequisitionType: "BOARD_CONVENED",
      isShortNotice: false,
      explanatoryStatementReference: "",
      egmReason: "",
    });
    setResolutions([]);
    setNominees([]);
    setResults([]);
    setActiveTab("schedule");
  };

  const loadShareholders = async (companyId: string) => {
    const { data, error } = await supabase
      .from("shareholders")
      .select("*")
      .eq("company_id", companyId);

    if (!error && data) setShareholders(data);
  };

  const loadResolutions = async (sessionId: string) => {
    const { data, error } = await supabase
      .from("resolutions")
      .select("*")
      .eq("voting_session_id", sessionId)
      .order("created_at", { ascending: true });

    if (!error && data) setResolutions(data as Resolution[]);
  };

  const loadNominees = async (sessionId: string) => {
    const { data, error } = await supabase
      .from("nominees")
      .select("*")
      .eq("voting_session_id", sessionId)
      .order("created_at", { ascending: true });

    if (!error && data) setNominees(data);
  };

  const loadResults = async (sessionId: string) => {
    const resRes = await (supabase
      .from("resolutions") as any)
      .select("*")
      .eq("voting_session_id", sessionId);

    if (resRes.error || !resRes.data) return;
    const resolutionsData = resRes.data as Resolution[];

    const mappedResults: ResolutionResult[] = await Promise.all(
      resolutionsData.map(async (res) => {
        const votesRes = await (supabase
          .from("votes") as any)
          .select("vote_value, weighted_votes")
          .eq("resolution_id", res.id);

        const votes = votesRes.data as Array<{ vote_value: string; weighted_votes?: number }> | null;

        let forCount = 0;
        let againstCount = 0;
        let abstainCount = 0;

        votes?.forEach((v) => {
          const weight = v.weighted_votes || 1;
          const val = (v.vote_value || "").toUpperCase();
          if (val === "FOR") forCount += weight;
          else if (val === "AGAINST") againstCount += weight;
          else if (val === "ABSTAIN") abstainCount += weight;
        });

        // Statutory majority calculations under Section 114
        const validVotes = forCount + againstCount;
        let isWinner = false;
        if (res.resolution_type === "special") {
          isWinner = validVotes > 0 && forCount >= 3 * againstCount;
        } else if (res.resolution_type === "unanimous") {
          isWinner = forCount > 0 && againstCount === 0;
        } else {
          // ordinary
          isWinner = forCount > againstCount;
        }

        return {
          id: res.id,
          title: res.title,
          description: res.description,
          resolution_type: res.resolution_type,
          stats: {
            for: forCount,
            against: againstCount,
            abstain: abstainCount,
            total: forCount + againstCount + abstainCount,
            winner: isWinner,
          },
        };
      })
    );

    setResults(mappedResults);
  };

  const loadAnchorStatus = async () => {
    if (!votingSession) return;
    const { data } = await supabase
      .from("block_anchors")
      .select("*")
      .eq("session_id", votingSession.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) setAnchorData(data);
  };

  useEffect(() => {
    if (votingSession) loadAnchorStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votingSession]);

  const handleAnchorToBlockchain = async () => {
    if (!votingSession || results.length === 0) return;
    setIsAnchoring(true);

    try {
      const votesRes = await (supabase
        .from("votes") as any)
        .select("vote_hash")
        .in("resolution_id", results.map(r => r.id));

      const allVotes = votesRes.data as Array<{ vote_hash: string }> | null;
      if (votesRes.error || !allVotes || allVotes.length === 0) {
        toast.error("No cast votes available to anchor.");
        setIsAnchoring(false);
        return;
      }

      const voteHashes = allVotes.map(v => v.vote_hash).sort();
      const tree = await MerkleTree.create(voteHashes);
      const root = tree.getRoot();
      const txHash = await simulateBlockchainTransaction();

      const { error: anchorError } = await (supabase
        .from("block_anchors") as any)
        .insert({
          session_id: votingSession.id,
          merkle_root: root,
          vote_count: voteHashes.length,
          started_at: votingSession.voting_start || votingSession.start_date,
          ended_at: votingSession.voting_end || votingSession.end_date,
          transaction_id: txHash,
          blockchain_network: "Polygon Amoy Testnet"
        });

      if (anchorError) throw anchorError;

      toast.success("Session votes cryptographically anchored to Polygon Blockchain!");
      await loadAnchorStatus();

    } catch (error: unknown) {
      console.error("Anchoring failed:", error);
      toast.error(`Anchoring failed: ${(error as Error).message}`);
    } finally {
      setIsAnchoring(false);
    }
  };

  const handleSessionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSessionForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleResolutionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResolutionForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNomineeInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNomineeForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateOrUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setIsSaving(true);

    try {
      sessionSchema.parse(sessionForm);

      const sessionPayload: Record<string, unknown> = {
        company_id: company.id,
        title: sessionForm.title.trim(),
        description: sessionForm.description?.trim() || null,
        event_type: sessionForm.eventType,
        voting_start: new Date(sessionForm.startDate).toISOString(),
        voting_end: new Date(sessionForm.endDate).toISOString(),
        meeting_date: sessionForm.meetingDate ? new Date(sessionForm.meetingDate).toISOString() : null,
        meeting_end_date: sessionForm.meetingEndDate ? new Date(sessionForm.meetingEndDate).toISOString() : null,
        notice_date: sessionForm.noticeDate ? new Date(sessionForm.noticeDate + "T00:00:00").toISOString() : null,
        meeting_link: sessionForm.meetingLink || null,
        meeting_password: sessionForm.meetingPassword || null,
        meeting_platform: sessionForm.meetingPlatform,
        voting_instructions: sessionForm.votingInstructions || null,
        record_date: sessionForm.recordDate ? new Date(sessionForm.recordDate + "T00:00:00").toISOString() : null,
        egm_requisition_type: sessionForm.eventType === "EGM" ? sessionForm.egmRequisitionType : null,
        is_short_notice: sessionForm.eventType === "EGM" ? !!sessionForm.isShortNotice : false,
        explanatory_statement_reference: sessionForm.eventType === "EGM" ? sessionForm.explanatoryStatementReference || null : null,
        egm_reason: sessionForm.eventType === "EGM" ? sessionForm.egmReason || null : null,
      };

      // Only set status for new sessions (start at draft); omit for updates to avoid strict state machine trigger conflicts
      if (!votingSession) {
        sessionPayload.status = "draft";
      }

      if (votingSession) {
        const { error } = await (supabase.from("voting_sessions") as any)
          .update(sessionPayload)
          .eq("id", votingSession.id);

        if (error) throw error;
        toast.success("Voting event updated successfully.");
        await loadVotingSessions(company.id, votingSession.id);
      } else {
        const { data, error } = await (supabase.from("voting_sessions") as any)
          .insert(sessionPayload)
          .select()
          .single();

        if (error) throw error;
        toast.success("Voting event created successfully.");
        if (data) {
          await loadVotingSessions(company.id, data.id);
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0]?.message || "Validation failed");
      } else {
        const errMsg = (err as Error)?.message || "Unknown error";
        console.error("Save event error:", err);
        toast.error(`Failed to save event settings: ${errMsg}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleTransitionStatus = async (newStatus: EventStatus) => {
    if (!votingSession || !company) return;
    try {
      const { error } = await (supabase.from("voting_sessions") as any)
        .update({ 
          status: newStatus,
          is_active: newStatus === "open"
        })
        .eq("id", votingSession.id);

      if (error) throw error;
      toast.success(`Event transitioned to ${newStatus.toUpperCase()}`);
      await loadVotingSessions(company.id, votingSession.id);
    } catch (err: unknown) {
      toast.error(`Status transition failed: ${(err as Error).message}`);
    }
  };

  // Lifecycle-aware next status transitions (strict state machine)
  const getNextTransition = (): { label: string; targetStatus: EventStatus; icon: "publish" | "play" | "pause" | "check" | "archive" } | null => {
    if (!votingSession) return null;
    const transitions: Record<string, { label: string; targetStatus: EventStatus; icon: "publish" | "play" | "pause" | "check" | "archive" }> = {
      draft: { label: "Publish Event", targetStatus: "published", icon: "publish" },
      published: { label: "Open Voting Window", targetStatus: "open", icon: "play" },
      open: { label: "Close Voting Window", targetStatus: "closed", icon: "pause" },
      closed: { label: "Finalize Results", targetStatus: "results_finalized", icon: "check" },
      results_finalized: { label: "Archive Session", targetStatus: "archived", icon: "archive" },
    };
    return transitions[votingSession.status] || null;
  };

  const handleNextTransition = async () => {
    const next = getNextTransition();
    if (!next) return;
    await handleTransitionStatus(next.targetStatus);
  };

  const handleAddResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!votingSession) {
      toast.error("Please create and save a voting session first.");
      return;
    }

    setIsAddingResolution(true);
    try {
      resolutionSchema.parse(resolutionForm);

      const { error } = await (supabase.from("resolutions") as any).insert({
        voting_session_id: votingSession.id,
        title: resolutionForm.title.trim(),
        description: resolutionForm.description.trim(),
        resolution_type: resolutionForm.resolutionType,
      });

      if (error) throw error;

      toast.success("Resolution agenda added to session ballot.");
      setResolutionForm({ title: "", description: "", resolutionType: "ordinary" });
      setShowAddResolution(false);
      await loadResolutions(votingSession.id);
      await loadResults(votingSession.id);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0]?.message || "Validation error");
      } else {
        toast.error("Failed to add resolution.");
      }
    } finally {
      setIsAddingResolution(false);
    }
  };

  const handleDeleteResolution = async (id: string) => {
    if (!confirm("Are you sure you want to remove this resolution agenda?")) return;

    const { error } = await (supabase.from("resolutions") as any).delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete resolution.");
      return;
    }

    toast.success("Resolution removed.");
    if (votingSession) {
      await loadResolutions(votingSession.id);
      await loadResults(votingSession.id);
    }
  };

  const handleAddNominee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!votingSession || !company) {
      toast.error("Create and save a voting session first.");
      return;
    }

    setIsAddingNominee(true);
    try {
      nomineeSchema.parse({
        name: nomineeForm.name,
        email: nomineeForm.email,
        designation: nomineeForm.designation,
        qualification: nomineeForm.qualification,
        experienceYears: nomineeForm.experienceYears ? parseInt(nomineeForm.experienceYears) : undefined,
        bio: nomineeForm.bio,
      });

      const { error } = await (supabase.from("nominees") as any).insert({
        voting_session_id: votingSession.id,
        company_id: company.id,
        nominee_name: nomineeForm.name.trim(),
        nominee_email: nomineeForm.email.trim().toLowerCase(),
        designation: nomineeForm.designation || null,
        qualification: nomineeForm.qualification || null,
        experience_years: nomineeForm.experienceYears ? parseInt(nomineeForm.experienceYears) : null,
        bio: nomineeForm.bio || null,
      });

      if (error) throw error;

      toast.success("Candidate nominee registered successfully.");
      setNomineeForm({ name: "", email: "", designation: "", qualification: "", experienceYears: "", bio: "" });
      setShowAddNominee(false);
      await loadNominees(votingSession.id);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0]?.message || "Validation failed");
      } else {
        toast.error("Failed to add nominee.");
      }
    } finally {
      setIsAddingNominee(false);
    }
  };

  const handleDeleteNominee = async (id: string) => {
    if (!confirm("Are you sure you want to remove this candidate nominee?")) return;

    const { error } = await (supabase.from("nominees") as any).delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete nominee.");
      return;
    }

    toast.success("Nominee removed.");
    if (votingSession) await loadNominees(votingSession.id);
  };

  const handleSendMeetingInvites = async () => {
    if (!votingSession || !sessionForm.meetingLink) {
      toast.error("Please configure and save meeting details first.");
      return;
    }

    setIsSendingEmails(true);
    try {
      const { error } = await supabase.functions.invoke("send-meeting-invites", {
        body: {
          sessionId: votingSession.id,
          companyName: company?.company_name,
          meetingLink: sessionForm.meetingLink,
          meetingPassword: sessionForm.meetingPassword,
          platform: sessionForm.meetingPlatform,
        },
        headers: {
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        },
      });

      if (error) throw error;

      await (supabase
        .from("voting_sessions") as any)
        .update({ is_meeting_emails_sent: true })
        .eq("id", votingSession.id);

      toast.success("Meeting invites dispatched to all shareholders.");
      if (company) await loadVotingSessions(company.id, votingSession.id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to dispatch meeting invites.");
    } finally {
      setIsSendingEmails(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!votingSession || results.length === 0) {
      toast.info("No resolution results available to generate Scrutinizer PDF.");
      return;
    }

    try {
      const { generateScrutinizerAuditPDF } = await import("@/lib/pdfReports");
      await generateScrutinizerAuditPDF({
        company,
        session: votingSession,
        results,
        shareholderCount: shareholders.length,
        totalShares: shareholders.reduce((acc, s) => acc + (s.shares_held || 0), 0),
        merkleRoot: anchorData?.merkle_root ? String(anchorData.merkle_root) : null,
        txHash: anchorData?.transaction_id ? String(anchorData.transaction_id) : null,
      });
      toast.success("Boardroom Scrutinizer Audit Report downloaded successfully!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF report.");
    }
  };

  const getSessionStatus = () => {
    if (!votingSession) return { status: "Not Configured", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" };

    const statusMap: Record<string, { status: string; color: string }> = {
      draft: { status: "Draft", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
      published: { status: "Published (Pre-Voting)", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
      open: { status: "Voting Open (Live)", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      closed: { status: "Voting Closed", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
      results_finalized: { status: "Results Finalized", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
      archived: { status: "Archived", color: "bg-gray-600/20 text-gray-400 border-gray-600/30" },
    };

    if (votingSession.status && statusMap[votingSession.status]) {
      return statusMap[votingSession.status];
    }

    const now = new Date();
    const vStart = new Date(votingSession.voting_start || votingSession.start_date || now);
    const vEnd = new Date(votingSession.voting_end || votingSession.end_date || now);

    if (now < vStart) return { status: "Scheduled", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
    if (now > vEnd) return { status: "Concluded", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" };

    return { status: "Live & Active", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const sessionStatus = getSessionStatus();

  return (
    <div className="min-h-screen relative bg-[#020817] text-white selection:bg-blue-500/30">
      <SEO
        title="Voting Event & Governance Hub | Vote India Secure"
        description="Configure AGM, EGM, and Postal Ballot resolutions, statutory schedules, virtual meeting streams, and live scrutinizer tallies."
        canonical="/voting-management"
        noindex={true}
      />

      <main className="pt-8 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* Header Bar with Event Switcher */}
          <div className="flex flex-col gap-5 mb-8 p-6 rounded-3xl bg-[#0d1b2a]/90 border border-white/20 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2 shadow-sm">
                  <Vote className="w-4 h-4 text-cyan-400" />
                  <span>Voting Event & Governance Hub</span>
                  {votingSession?.event_type && (
                    <span className="ml-1 px-2 py-0.5 rounded bg-cyan-500/30 text-white font-extrabold text-[10px]">
                      {votingSession.event_type}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {votingSession?.title || "Create / Configure Voting Event"}
                </h1>
                <p className="text-slate-200 text-xs mt-1 font-medium leading-relaxed">
                  Configure corporate voting events (AGM, EGM, Postal Ballot), legal notices, virtual streams, and live scrutinizer tallies.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${sessionStatus.color}`}>
                  {sessionStatus.status}
                </span>
                <Button 
                  onClick={handleNewSession}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs gap-1.5 py-2 px-3.5 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Event
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/company-dashboard")}
                  className="border-white/30 hover:bg-white/10 text-white rounded-xl text-xs font-bold px-3 py-2"
                >
                  Dashboard
                </Button>
              </div>
            </div>

            {/* Event Switcher Selector Bar */}
            {allSessions.length > 0 && (
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mr-1">Events:</span>
                {allSessions.map((s) => {
                  const isCurrent = s.id === votingSession?.id;
                  const typeColors: Record<string, string> = {
                    AGM: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10",
                    EGM: "border-amber-500/40 text-amber-300 bg-amber-500/10",
                    POSTAL_BALLOT: "border-blue-500/40 text-blue-300 bg-blue-500/10",
                    GENERAL_MEETING: "border-slate-500/40 text-slate-300 bg-slate-500/10",
                  };
                  const colorClass = typeColors[s.event_type] || typeColors.GENERAL_MEETING;

                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => company && loadVotingSessions(company.id, s.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                        isCurrent
                          ? "bg-blue-600 text-white border-cyan-400 shadow-md ring-1 ring-cyan-400"
                          : `${colorClass} hover:bg-white/10`
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider">{s.event_type}</span>
                      <span className="truncate max-w-[150px] sm:max-w-[200px]">{s.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Main Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-[#0d1b2a]/95 backdrop-blur border border-white/20 p-1.5 rounded-2xl shadow-xl">
              <TabsTrigger value="overview" className="gap-2 font-bold data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white rounded-xl text-xs">
                <FileText className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="gap-2 font-bold data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white rounded-xl text-xs">
                <CalendarDays className="w-4 h-4" />
                <span>Schedule</span>
              </TabsTrigger>
              <TabsTrigger value="resolutions" className="gap-2 font-bold data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white rounded-xl text-xs">
                <Layers className="w-4 h-4" />
                <span>Resolutions</span>
              </TabsTrigger>
              <TabsTrigger value="meeting" className="gap-2 font-bold data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white rounded-xl text-xs">
                <Video className="w-4 h-4" />
                <span>Virtual Meeting</span>
              </TabsTrigger>
              <TabsTrigger value="nominees" className="gap-2 font-bold data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white rounded-xl text-xs">
                <UserPlus className="w-4 h-4" />
                <span>Nominees</span>
              </TabsTrigger>
              <TabsTrigger value="results" className="gap-2 font-bold data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white rounded-xl text-xs">
                <Trophy className="w-4 h-4" />
                <span>Results</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: OVERVIEW */}
            <TabsContent value="overview" className="space-y-6">
              
              {/* 4 Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <Card className="bg-[#0d1b2a]/90 border-white/20 backdrop-blur-xl shadow-xl">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-slate-200 uppercase tracking-wider">Shareholders</p>
                        <p className="text-3xl font-black text-white mt-1 tabular-nums">{shareholders.length}</p>
                        <p className="text-xs text-cyan-300 mt-1 font-bold">Eligible Voters</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0d1b2a]/90 border-white/20 backdrop-blur-xl shadow-xl">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-slate-200 uppercase tracking-wider">Resolutions</p>
                        <p className="text-3xl font-black text-white mt-1 tabular-nums">{resolutions.length}</p>
                        <p className="text-xs text-emerald-300 mt-1 font-bold">Active Agendas</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                        <Layers className="w-6 h-6 text-emerald-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0d1b2a]/90 border-white/20 backdrop-blur-xl shadow-xl">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-slate-200 uppercase tracking-wider">Director Nominees</p>
                        <p className="text-3xl font-black text-white mt-1 tabular-nums">{nominees.length}</p>
                        <p className="text-xs text-amber-300 mt-1 font-bold">On Active Ballot</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
                        <UserPlus className="w-6 h-6 text-amber-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0d1b2a]/90 border-white/20 backdrop-blur-xl shadow-xl">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-slate-200 uppercase tracking-wider">Invites Dispatch</p>
                        <p className="text-2xl font-black text-white mt-1">
                          {votingSession?.is_meeting_emails_sent ? "Dispatched" : "Pending"}
                        </p>
                        <p className="text-xs text-purple-300 mt-1 font-bold">Meeting Links</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
                        <Mail className="w-6 h-6 text-purple-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Session Controls & Quick Actions */}
              {votingSession && (
                <Card className="border-white/20 bg-[#0d1b2a]/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Session Operations & Actions
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {(() => {
                      const next = getNextTransition();
                      if (!next) return (
                        <Button disabled className="bg-slate-600 text-white font-bold rounded-xl gap-2 cursor-not-allowed">
                          <CheckCircle2 className="w-4 h-4" /> Session Archived
                        </Button>
                      );
                      const iconMap = {
                        publish: <Send className="w-4 h-4" />,
                        play: <Play className="w-4 h-4" />,
                        pause: <Pause className="w-4 h-4" />,
                        check: <CheckCircle2 className="w-4 h-4" />,
                        archive: <FileCheck2 className="w-4 h-4" />,
                      };
                      const colorMap = {
                        publish: "bg-blue-600 hover:bg-blue-700",
                        play: "bg-emerald-600 hover:bg-emerald-700",
                        pause: "bg-amber-600 hover:bg-amber-700",
                        check: "bg-purple-600 hover:bg-purple-700",
                        archive: "bg-slate-600 hover:bg-slate-700",
                      };
                      return (
                        <Button
                          onClick={handleNextTransition}
                          className={`${colorMap[next.icon]} text-white font-bold rounded-xl gap-2`}
                        >
                          {iconMap[next.icon]} {next.label}
                        </Button>
                      );
                    })()}

                    <Button
                      variant="outline"
                      onClick={handleSendMeetingInvites}
                      disabled={isSendingEmails || !sessionForm.meetingLink}
                      className="border-white/30 hover:bg-white/10 text-white font-bold rounded-xl gap-2"
                    >
                      {isSendingEmails ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <Send className="w-4 h-4 text-cyan-400" />}
                      {votingSession.is_meeting_emails_sent ? "Resend Meeting Invites" : "Dispatch Meeting Invites"}
                    </Button>

                    {sessionForm.meetingLink && (
                      <Button
                        variant="ghost"
                        onClick={() => window.open(sessionForm.meetingLink, "_blank")}
                        className="hover:bg-white/10 text-slate-100 hover:text-white font-semibold rounded-xl gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Preview Virtual Meeting Room
                      </Button>
                    )}
                  </div>
                </Card>
              )}

            </TabsContent>

            {/* TAB 2: SCHEDULE CONFIGURATION */}
            <TabsContent value="schedule" className="space-y-6">
              <Card className="border-white/20 bg-[#0d1b2a]/90 backdrop-blur-xl rounded-3xl shadow-xl">
                <CardHeader className="border-b border-white/15 pb-4">
                  <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-cyan-400" />
                    Voting Event & Schedule Configuration
                  </CardTitle>
                  <CardDescription className="text-slate-100 font-normal">
                    Configure statutory meeting classification (AGM / EGM / Postal Ballot), Section 101/102 notices, and precise voting window timestamps.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleCreateOrUpdateSession} className="space-y-6">
                    {/* Event Type Classification */}
                    <div className="space-y-3">
                      <Label className="text-xs font-bold text-slate-100 flex items-center justify-between">
                        <span>Event Type (Statutory Meeting / Ballot Classification)</span>
                        <span className="text-[11px] text-cyan-400 font-semibold">Section 96, 100, 110 Compliance</span>
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { type: "AGM", label: "Annual General Meeting (AGM)", desc: "Sec 96 - Ordinary & Special business" },
                          { type: "EGM", label: "Extraordinary General Meeting (EGM)", desc: "Sec 100 - Urgent & Special business" },
                          { type: "POSTAL_BALLOT", label: "Postal Ballot", desc: "Sec 110 & Rule 22 - Remote e-voting only" },
                          { type: "GENERAL_MEETING", label: "General Meeting", desc: "Class meeting / Creditors meeting" },
                        ].map(opt => (
                          <button
                            key={opt.type}
                            type="button"
                            onClick={() => setSessionForm(prev => ({ ...prev, eventType: opt.type as EventType }))}
                            className={`p-3 rounded-2xl border text-left transition-all ${
                              sessionForm.eventType === opt.type
                                ? "bg-blue-600/30 border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg text-white"
                                : "bg-black/40 border-white/15 text-slate-300 hover:border-white/30 hover:bg-white/5"
                            }`}
                          >
                            <div className="text-xs font-black uppercase tracking-wider text-cyan-300 mb-1">{opt.type.replace('_', ' ')}</div>
                            <div className="text-xs font-bold text-white leading-tight">{opt.label}</div>
                            <div className="text-[10px] text-slate-400 mt-1 leading-snug">{opt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="title" className="text-xs font-bold text-slate-100">Voting Event Title</Label>
                        <Input
                          id="title"
                          name="title"
                          value={sessionForm.title}
                          onChange={handleSessionInputChange}
                          placeholder={sessionForm.eventType === "EGM" ? "e.g. Extraordinary General Meeting (EGM) - Notice Ref: 2026/04" : "e.g. 105th Annual General Meeting (AGM)"}
                          className="bg-black/60 border-white/20 text-white rounded-xl font-medium"
                          required
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description" className="text-xs font-bold text-slate-100">Session Description & Notice Summary</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={sessionForm.description}
                          onChange={handleSessionInputChange}
                          placeholder="Provide context on resolutions, voting instructions, and statutory notice references..."
                          className="bg-black/60 border-white/20 text-white rounded-xl font-medium"
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* EGM Governance Section */}
                    {sessionForm.eventType === "EGM" && (
                      <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-4">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>Section 100 & 102 EGM Governance Parameters</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="egmRequisitionType" className="text-xs font-bold text-slate-100">
                              Requisition Authority (Section 100)
                            </Label>
                            <Select
                              value={sessionForm.egmRequisitionType}
                              onValueChange={(val) => setSessionForm(prev => ({ ...prev, egmRequisitionType: val as EgmRequisitionType }))}
                            >
                              <SelectTrigger id="egmRequisitionType" className="bg-black/60 border-white/20 text-white rounded-xl font-bold">
                                <SelectValue placeholder="Select requisition type" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#020817] border-white/20 text-white rounded-xl">
                                <SelectItem value="BOARD_CONVENED">Board Convened (Section 100(1))</SelectItem>
                                <SelectItem value="MEMBER_REQUISITION_SEC_100">On Members' Requisition (Section 100(2))</SelectItem>
                                <SelectItem value="NCLT_DIRECTED">NCLT / Tribunal Directed (Section 98)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="explanatoryStatementReference" className="text-xs font-bold text-slate-100">
                              Section 102 Explanatory Statement Reference
                            </Label>
                            <Input
                              id="explanatoryStatementReference"
                              name="explanatoryStatementReference"
                              value={sessionForm.explanatoryStatementReference}
                              onChange={handleSessionInputChange}
                              placeholder="e.g. Annexure-II of Notice Ref EGM-2026-01"
                              className="bg-black/60 border-white/20 text-white rounded-xl font-medium"
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="egmReason" className="text-xs font-bold text-slate-100">
                              Statutory Reason / Matter for EGM Requisition
                            </Label>
                            <Textarea
                              id="egmReason"
                              name="egmReason"
                              value={sessionForm.egmReason}
                              onChange={handleSessionInputChange}
                              placeholder="e.g. Urgent appointment of new statutory auditor / Approval of material related party transaction"
                              className="bg-black/60 border-white/20 text-white rounded-xl font-medium"
                              rows={2}
                            />
                          </div>

                          <div className="md:col-span-2 p-3.5 rounded-xl bg-black/40 border border-amber-500/20 flex items-start gap-3">
                            <Checkbox
                              id="isShortNotice"
                              checked={sessionForm.isShortNotice}
                              onCheckedChange={(checked) => setSessionForm(prev => ({ ...prev, isShortNotice: !!checked }))}
                              className="mt-1 border-amber-400/50 data-[state=checked]:bg-amber-500"
                            />
                            <div className="space-y-1">
                              <Label htmlFor="isShortNotice" className="text-xs font-bold text-amber-200 cursor-pointer">
                                Convened on Shorter Notice under Section 101(1) of Companies Act, 2013
                              </Label>
                              <p className="text-[11px] text-slate-300 leading-relaxed">
                                Statutory requirement: For EGM, shorter notice requires consent of majority in number of members entitled to vote AND representing ≥95% of paid-up share capital with voting rights (or ≥95% total voting power for companies without share capital).
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rule 20 Informational Callout */}
                    <div className="p-4 rounded-2xl bg-blue-950/25 border border-cyan-500/30 flex items-start gap-3">
                      <Info className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-cyan-200">Rule 20 Informational Assessment</p>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Under Rule 20 of Companies (Management and Administration) Rules, 2014, mandatory remote e-voting applies to listed companies and unlisted public companies with ≥ 1,000 shareholders (excluding NRE/SME exemptions). Verify current legal requirements and applicable exemptions with qualified legal counsel.
                        </p>
                      </div>
                    </div>

                    {/* Canonical Timings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="noticeDate" className="text-xs font-bold text-slate-100">Notice Dispatch Date (Sec 101)</Label>
                        <Input
                          id="noticeDate"
                          name="noticeDate"
                          type="date"
                          value={sessionForm.noticeDate}
                          onChange={handleSessionInputChange}
                          className="bg-black/60 border-white/20 text-white rounded-xl font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="meetingDate" className="text-xs font-bold text-slate-100">Meeting Commencement</Label>
                        <Input
                          id="meetingDate"
                          name="meetingDate"
                          type="datetime-local"
                          value={sessionForm.meetingDate}
                          onChange={handleSessionInputChange}
                          className="bg-black/60 border-white/20 text-white rounded-xl font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="meetingEndDate" className="text-xs font-bold text-slate-100">Meeting Adjournment / End</Label>
                        <Input
                          id="meetingEndDate"
                          name="meetingEndDate"
                          type="datetime-local"
                          value={sessionForm.meetingEndDate}
                          onChange={handleSessionInputChange}
                          className="bg-black/60 border-white/20 text-white rounded-xl font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-xs font-bold text-slate-100">Remote Voting Start (UTC/Local)</Label>
                        <Input
                          id="startDate"
                          name="startDate"
                          type="datetime-local"
                          value={sessionForm.startDate}
                          onChange={handleSessionInputChange}
                          className="bg-black/60 border-white/20 text-white rounded-xl font-medium"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endDate" className="text-xs font-bold text-slate-100">Remote Voting Cutoff (UTC/Local)</Label>
                        <Input
                          id="endDate"
                          name="endDate"
                          type="datetime-local"
                          value={sessionForm.endDate}
                          onChange={handleSessionInputChange}
                          className="bg-black/60 border-white/20 text-white rounded-xl font-medium"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="recordDate" className="text-xs font-bold text-slate-100">Statutory Record Date</Label>
                        <Input
                          id="recordDate"
                          name="recordDate"
                          type="date"
                          value={sessionForm.recordDate}
                          onChange={handleSessionInputChange}
                          className="bg-black/60 border-white/20 text-white rounded-xl font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/10">
                      <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 gap-2 shadow-lg">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Save Schedule Configuration
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: RESOLUTIONS & AGENDAS */}
            <TabsContent value="resolutions" className="space-y-6">
              <Card className="border-white/20 bg-[#0d1b2a]/90 backdrop-blur-xl rounded-3xl shadow-xl">
                <CardHeader className="border-b border-white/15 pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-cyan-400" />
                      Resolution Agendas & Ballots
                    </CardTitle>
                    <CardDescription className="text-slate-100 text-xs font-medium">
                      Define the statutory motions and resolutions that shareholders will vote upon.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowAddResolution(!showAddResolution)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs gap-2 shadow-md"
                  >
                    {showAddResolution ? "Cancel" : <><Plus className="w-4 h-4" /> Add Resolution</>}
                  </Button>
                </CardHeader>

                {showAddResolution && (
                  <CardContent className="pt-6 border-b border-white/15 bg-black/30">
                    <form onSubmit={handleAddResolution} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="resTitle" className="text-xs font-bold text-slate-100">Resolution Title / Item</Label>
                          <Input
                            id="resTitle"
                            name="title"
                            value={resolutionForm.title}
                            onChange={handleResolutionInputChange}
                            placeholder="e.g. Adoption of Audited Financial Statements for FY 2025-26"
                            className="bg-black/60 border-white/20 text-white rounded-xl font-medium"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="resType" className="text-xs font-bold text-slate-100">Resolution Type</Label>
                          <Select
                            value={resolutionForm.resolutionType}
                            onValueChange={(val) => setResolutionForm(prev => ({ ...prev, resolutionType: val as "ordinary" | "special" | "unanimous" }))}
                          >
                            <SelectTrigger className="bg-black/60 border-white/20 text-white rounded-xl font-bold">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#020817] border-white/20 text-white rounded-xl">
                              <SelectItem value="ordinary">Ordinary Resolution (Simple Majority &gt; 50%)</SelectItem>
                              <SelectItem value="special">Special Resolution (Supermajority &gt; 75%)</SelectItem>
                              <SelectItem value="unanimous">Unanimous Consent (100%)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="resDesc" className="text-xs font-bold text-slate-100">Explanatory Statement / Agenda Text</Label>
                          <Textarea
                            id="resDesc"
                            name="description"
                            value={resolutionForm.description}
                            onChange={handleResolutionInputChange}
                            placeholder="To receive, consider and adopt the audited standalone and consolidated financial statements..."
                            className="bg-black/60 border-white/20 text-white rounded-xl font-medium"
                            rows={3}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isAddingResolution} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 shadow-lg">
                          {isAddingResolution ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                          Add Resolution to Ballot
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                )}

                <CardContent className="pt-6">
                  {resolutions.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Layers className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                      <p className="text-white font-bold">No resolutions added yet.</p>
                      <p className="text-xs text-slate-200 mt-1">Click Add Resolution above to build the voting ballot.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {resolutions.map((res, index) => (
                        <div key={res.id} className="p-5 rounded-2xl bg-black/40 border border-white/15 flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-400/30 font-mono">
                                ITEM #{index + 1}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase border border-blue-400/30">
                                {res.resolution_type || "Ordinary"}
                              </span>
                            </div>
                            <h4 className="font-bold text-white text-base mt-2">{res.title}</h4>
                            <p className="text-xs text-slate-100 leading-relaxed">{res.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteResolution(res.id)}
                            className="hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: VIRTUAL MEETING */}
            <TabsContent value="meeting" className="space-y-6">
              <Card className="border-white/20 bg-[#0d1b2a]/90 backdrop-blur-xl rounded-3xl shadow-xl">
                <CardHeader className="border-b border-white/15 pb-4">
                  <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                    <Video className="w-5 h-5 text-cyan-400" />
                    Virtual Meeting Room & Stream
                  </CardTitle>
                  <CardDescription className="text-slate-100 font-normal">
                    Connect Zoom, Microsoft Teams, Webex, or Google Meet for live video proceedings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleCreateOrUpdateSession} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="meetingPlatform" className="text-xs font-bold text-slate-100">Platform</Label>
                        <Select
                          value={sessionForm.meetingPlatform}
                          onValueChange={(value) => setSessionForm(prev => ({ ...prev, meetingPlatform: value }))}
                        >
                          <SelectTrigger className="bg-black/60 border-white/20 text-white rounded-xl font-bold">
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#020817] border-white/20 text-white">
                            <SelectItem value="zoom">Zoom Video Communications</SelectItem>
                            <SelectItem value="teams">Microsoft Teams</SelectItem>
                            <SelectItem value="meet">Google Meet</SelectItem>
                            <SelectItem value="webex">Cisco Webex</SelectItem>
                            <SelectItem value="other">Other / Custom Stream</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="meetingPassword" className="text-xs font-bold text-slate-100">Room Passcode (Optional)</Label>
                        <Input
                          id="meetingPassword"
                          name="meetingPassword"
                          type="text"
                          value={sessionForm.meetingPassword}
                          onChange={handleSessionInputChange}
                          placeholder="e.g. AGM2026Secure"
                          className="bg-black/60 border-white/20 text-white rounded-xl font-medium"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="meetingLink" className="text-xs font-bold text-slate-100">Live Meeting URL</Label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <Input
                            id="meetingLink"
                            name="meetingLink"
                            value={sessionForm.meetingLink}
                            onChange={handleSessionInputChange}
                            placeholder="https://zoom.us/j/123456789"
                            className="pl-10 bg-black/60 border-white/20 text-white rounded-xl font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/10">
                      <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 gap-2 shadow-lg">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Save Virtual Meeting Details
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 5: NOMINEES */}
            <TabsContent value="nominees" className="space-y-6">
              <Card className="border-white/20 bg-[#0d1b2a]/90 backdrop-blur-xl rounded-3xl shadow-xl">
                <CardHeader className="border-b border-white/15 pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-cyan-400" />
                      Director & Nominee Agendas
                    </CardTitle>
                    <CardDescription className="text-slate-100 text-xs font-medium">
                      Manage candidates standing for election to the board of directors.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowAddNominee(!showAddNominee)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs gap-2 shadow-md"
                  >
                    {showAddNominee ? "Cancel" : <><Plus className="w-4 h-4" /> Add Nominee</>}
                  </Button>
                </CardHeader>

                {showAddNominee && (
                  <CardContent className="pt-6 border-b border-white/15 bg-black/30">
                    <form onSubmit={handleAddNominee} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nomName" className="text-xs font-bold text-slate-100">Candidate Full Name</Label>
                          <Input
                            id="nomName"
                            name="name"
                            value={nomineeForm.name}
                            onChange={handleNomineeInputChange}
                            placeholder="e.g. Dr. Arthur Vance"
                            className="bg-black/60 border-white/20 text-white rounded-xl font-medium"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nomEmail" className="text-xs font-bold text-slate-100">Email Address</Label>
                          <Input
                            id="nomEmail"
                            name="email"
                            type="email"
                            value={nomineeForm.email}
                            onChange={handleNomineeInputChange}
                            placeholder="candidate@enterprise.com"
                            className="bg-black/60 border-white/20 text-white rounded-xl font-medium"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nomDesig" className="text-xs font-bold text-slate-100">Proposed Designation</Label>
                          <Input
                            id="nomDesig"
                            name="designation"
                            value={nomineeForm.designation}
                            onChange={handleNomineeInputChange}
                            placeholder="e.g. Independent Non-Executive Director"
                            className="bg-black/60 border-white/20 text-white rounded-xl font-medium"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nomExp" className="text-xs font-bold text-slate-100">Years of Experience</Label>
                          <Input
                            id="nomExp"
                            name="experienceYears"
                            type="number"
                            value={nomineeForm.experienceYears}
                            onChange={handleNomineeInputChange}
                            placeholder="18"
                            min="0"
                            className="bg-black/60 border-white/20 text-white rounded-xl font-medium"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isAddingNominee} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 shadow-lg">
                          {isAddingNominee ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                          Add to Ballot
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                )}

                <CardContent className="pt-6">
                  {nominees.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <UserPlus className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                      <p className="text-white font-bold">No nominees registered for this session.</p>
                      <p className="text-xs text-slate-200 mt-1">Click Add Nominee above to register candidates.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {nominees.map((nominee) => (
                        <div key={nominee.id} className="p-5 rounded-2xl bg-black/40 border border-white/15 flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-bold text-white text-base">{nominee.nominee_name}</h4>
                            <p className="text-xs text-slate-200 font-medium">{nominee.nominee_email}</p>
                            <div className="flex flex-wrap gap-2 mt-2.5">
                              {nominee.designation && (
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold border border-blue-400/30">
                                  {nominee.designation}
                                </span>
                              )}
                              {nominee.experience_years && (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                                  {nominee.experience_years} Years Exp
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNominee(nominee.id)}
                            className="hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 6: RESULTS & AUDIT */}
            <TabsContent value="results" className="space-y-6">
              <Card className="border-white/20 bg-[#0d1b2a]/90 backdrop-blur-xl rounded-3xl shadow-xl">
                <CardHeader className="border-b border-white/15 pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-400" />
                      Scrutinizer Audit & Official Results
                    </CardTitle>
                    <CardDescription className="text-slate-100 text-xs font-medium">
                      Cryptographically verified vote tallies and exchange disclosure exports.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    {results.length > 0 && (
                      <Button 
                        onClick={handleAnchorToBlockchain}
                        disabled={isAnchoring}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs gap-2 shadow-lg"
                      >
                        {isAnchoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4 text-purple-200" />}
                        Anchor to Polygon
                      </Button>
                    )}
                    {results.length > 0 && (
                      <Button 
                        onClick={handleDownloadPDF} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs gap-2 shadow-lg"
                      >
                        <Download className="w-4 h-4" />
                        Download Scrutinizer PDF
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {results.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                      <p className="text-white font-bold">No votes recorded yet.</p>
                      <p className="text-xs text-slate-200 mt-1">Cast ballots will appear here in real time.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {results.map((item) => (
                        <div key={item.id} className="p-6 rounded-2xl bg-black/40 border border-white/15">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-bold text-white text-base">{item.title}</h4>
                              <p className="text-xs text-slate-200 mt-0.5">{item.description}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${item.stats.winner ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border-rose-500/30"}`}>
                                {item.stats.winner 
                                  ? (item.resolution_type === 'special' 
                                      ? "PASSED (SPECIAL RESOLUTION ≥75%)" 
                                      : item.resolution_type === 'unanimous' 
                                        ? "PASSED (UNANIMOUS 100%)" 
                                        : "PASSED (ORDINARY — FOR > AGAINST)")
                                  : "REJECTED (FAILED STATUTORY THRESHOLD)"}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {item.resolution_type === 'special' 
                                  ? "Sec 114(2): Assent ≥ 3x Dissent" 
                                  : item.resolution_type === 'unanimous'
                                    ? "100% Unanimous Assent"
                                    : "Sec 114(1): Simple Majority"}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                              <div className="text-2xl font-black text-emerald-400 tabular-nums">{item.stats.for.toLocaleString()}</div>
                              <div className="text-[11px] font-bold text-emerald-300 uppercase mt-1">Votes In Favor</div>
                            </div>
                            <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30">
                              <div className="text-2xl font-black text-rose-400 tabular-nums">{item.stats.against.toLocaleString()}</div>
                              <div className="text-[11px] font-bold text-rose-300 uppercase mt-1">Votes Against</div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-500/15 border border-slate-500/30">
                              <div className="text-2xl font-black text-slate-200 tabular-nums">{item.stats.abstain.toLocaleString()}</div>
                              <div className="text-[11px] font-bold text-slate-300 uppercase mt-1">Abstained</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>

        </div>
      </main>

    </div>
  );
};

export default VotingManagement;
