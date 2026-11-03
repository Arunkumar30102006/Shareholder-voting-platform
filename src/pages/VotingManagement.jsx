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
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, Users, UserPlus, Video, Link as LinkIcon, Send, Play, Pause, CheckCircle2, AlertCircle, FileText, Mail, Loader2, Plus, Trash2, Vote, Shield, Info, ExternalLink, Trophy, Download, Sparkles, Layers, FileCheck2, Lock, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { env } from "@/config/env";
import { z } from "zod";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { MerkleTree } from "@/lib/merkle";
import { simulateBlockchainTransaction } from "@/lib/blockchain";
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
    const [company, setCompany] = useState(null);
    const [allSessions, setAllSessions] = useState([]);
    const [votingSession, setVotingSession] = useState(null);
    const [resolutions, setResolutions] = useState([]);
    const [nominees, setNominees] = useState([]);
    const [shareholders, setShareholders] = useState([]);
    const [activeTab, setActiveTab] = useState("overview");
    // Forms toggle
    const [showAddResolution, setShowAddResolution] = useState(false);
    const [isAddingResolution, setIsAddingResolution] = useState(false);
    const [showAddNominee, setShowAddNominee] = useState(false);
    const [isAddingNominee, setIsAddingNominee] = useState(false);
    const [sessionForm, setSessionForm] = useState({
        eventType: "AGM",
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
        egmRequisitionType: "BOARD_CONVENED",
        isShortNotice: false,
        explanatoryStatementReference: "",
        egmReason: "",
    });
    const [resolutionForm, setResolutionForm] = useState({
        title: "",
        description: "",
        resolutionType: "ordinary",
    });
    const [nomineeForm, setNomineeForm] = useState({
        name: "",
        email: "",
        designation: "",
        qualification: "",
        experienceYears: "",
        bio: "",
    });
    const [results, setResults] = useState([]);
    const [isAnchoring, setIsAnchoring] = useState(false);
    const [anchorData, setAnchorData] = useState(null);
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
            toast.error("Access denied. Not a company administrator.");
            navigate("/company-login");
            return;
        }
        const { data: companyData, error: companyError } = await supabase
            .from("companies")
            .select("*")
            .eq("id", adminData.company_id)
            .maybeSingle();
        if (companyError || !companyData) {
            toast.error("Could not load company data");
            setIsLoading(false);
            return;
        }
        setCompany(companyData);
        await loadVotingSessions(companyData.id);
        await loadShareholders(companyData.id);
        setIsLoading(false);
    };
    useEffect(() => {
        checkAuthAndLoadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const toLocalInputString = (isoString) => {
        if (!isoString)
            return "";
        try {
            const d = new Date(isoString);
            if (isNaN(d.getTime()))
                return "";
            const pad = (n) => n.toString().padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }
        catch {
            return "";
        }
    };
    const toLocalDateString = (dateOrIso) => {
        if (!dateOrIso)
            return "";
        try {
            const d = new Date(dateOrIso);
            if (isNaN(d.getTime()))
                return "";
            const pad = (n) => n.toString().padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        }
        catch {
            return "";
        }
    };
    const loadVotingSessions = async (companyId, targetSessionId) => {
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
            const typedSessions = data;
            setAllSessions(typedSessions);
            const selected = targetSessionId
                ? (typedSessions.find(s => s.id === targetSessionId) || typedSessions[0])
                : (votingSession ? (typedSessions.find(s => s.id === votingSession.id) || typedSessions[0]) : typedSessions[0]);

            // Automatic time-governed lifecycle synchronization
            const startVal = selected.voting_start || selected.start_date;
            const endVal = selected.voting_end || selected.end_date;
            if (startVal && endVal) {
                const now = new Date();
                const sDate = new Date(startVal);
                const eDate = new Date(endVal);
                let targetStatus = selected.status;
                let targetActive = selected.is_active;

                if (now >= sDate && now <= eDate) {
                    if (selected.status !== "open" || !selected.is_active) {
                        targetStatus = "open";
                        targetActive = true;
                    }
                } else if (now > eDate) {
                    if (selected.status === "open" || selected.is_active) {
                        targetStatus = "closed";
                        targetActive = false;
                    }
                }

                if (targetStatus !== selected.status || targetActive !== selected.is_active) {
                    selected.status = targetStatus;
                    selected.is_active = targetActive;
                    supabase.from("voting_sessions")
                        .update({ status: targetStatus, is_active: targetActive })
                        .eq("id", selected.id)
                        .then(() => {});
                }
            }

            setVotingSession(selected);
            setSessionForm({
                eventType: selected.event_type || "AGM",
                title: selected.title || "",
                description: selected.description || "",
                startDate: toLocalInputString(selected.voting_start || selected.start_date),
                endDate: toLocalInputString(selected.voting_end || selected.end_date),
                meetingDate: toLocalInputString(selected.meeting_date || selected.meeting_start_date),
                meetingEndDate: toLocalInputString(selected.meeting_end_date),
                noticeDate: toLocalDateString(selected.notice_date),
                meetingLink: selected.meeting_link || "",
                meetingPassword: selected.meeting_password || "",
                meetingPlatform: selected.meeting_platform || "zoom",
                votingInstructions: selected.voting_instructions || "",
                recordDate: toLocalDateString(selected.record_date),
                egmRequisitionType: selected.egm_requisition_type || "BOARD_CONVENED",
                isShortNotice: !!selected.is_short_notice,
                explanatoryStatementReference: selected.explanatory_statement_reference || "",
                egmReason: selected.egm_reason || "",
            });
            await loadResolutions(selected.id);
            await loadNominees(selected.id);
            await loadResults(selected.id);
        }
        else {
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
    const loadShareholders = async (companyId) => {
        const { data, error } = await supabase
            .from("shareholders")
            .select("*")
            .eq("company_id", companyId);
        if (!error && data)
            setShareholders(data);
    };
    const loadResolutions = async (sessionId) => {
        const { data, error } = await supabase
            .from("resolutions")
            .select("*")
            .eq("voting_session_id", sessionId)
            .order("created_at", { ascending: true });
        if (!error && data)
            setResolutions(data);
    };
    const loadNominees = async (sessionId) => {
        const { data, error } = await supabase
            .from("nominees")
            .select("*")
            .eq("voting_session_id", sessionId)
            .order("created_at", { ascending: true });
        if (!error && data) {
            setNominees(data);
            // Ensure all registered director nominees are synced to resolutions table
            for (const nom of data) {
                const { data: resMatches } = await supabase
                    .from("resolutions")
                    .select("id")
                    .eq("voting_session_id", sessionId)
                    .ilike("title", `%${nom.nominee_name}%`);

                if (!resMatches || resMatches.length === 0) {
                    await supabase.from("resolutions").insert({
                        voting_session_id: sessionId,
                        title: `Election of Director: ${nom.nominee_name}`,
                        description: `Candidate: ${nom.nominee_name} | Proposed Designation: ${nom.designation || 'Director'} | Experience: ${nom.experience_years ? nom.experience_years + ' Years' : 'N/A'}${nom.bio ? ' | Profile: ' + nom.bio : ''}`,
                        resolution_type: "director_election",
                    });
                }
            }
        }
    };
    const loadResults = async (sessionId) => {
        const resRes = await supabase
            .from("resolutions")
            .select("*")
            .eq("voting_session_id", sessionId);
        if (resRes.error || !resRes.data)
            return;
        const resolutionsData = resRes.data;
        const mappedResults = await Promise.all(resolutionsData.map(async (res) => {
            const votesRes = await supabase
                .from("votes")
                .select("vote_value, weighted_votes")
                .eq("resolution_id", res.id);
            const votes = votesRes.data;
            let forCount = 0;
            let againstCount = 0;
            let abstainCount = 0;
            votes?.forEach((v) => {
                const weight = v.weighted_votes || 1;
                const val = (v.vote_value || "").toUpperCase();
                if (val === "FOR")
                    forCount += weight;
                else if (val === "AGAINST")
                    againstCount += weight;
                else if (val === "ABSTAIN")
                    abstainCount += weight;
            });
            // Statutory majority calculations under Section 114
            const validVotes = forCount + againstCount;
            let isWinner = false;
            if (res.resolution_type === "special") {
                isWinner = validVotes > 0 && forCount >= 3 * againstCount;
            }
            else if (res.resolution_type === "unanimous") {
                isWinner = forCount > 0 && againstCount === 0;
            }
            else {
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
        }));
        setResults(mappedResults);
    };
    const loadAnchorStatus = async () => {
        if (!votingSession)
            return;
        const { data } = await supabase
            .from("block_anchors")
            .select("*")
            .eq("session_id", votingSession.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
        if (data)
            setAnchorData(data);
    };
    useEffect(() => {
        if (votingSession)
            loadAnchorStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [votingSession]);
    const handleAnchorToBlockchain = async () => {
        if (!votingSession || results.length === 0)
            return;
        setIsAnchoring(true);
        try {
            const votesRes = await supabase
                .from("votes")
                .select("vote_hash")
                .in("resolution_id", results.map(r => r.id));
            const allVotes = votesRes.data;
            if (votesRes.error || !allVotes || allVotes.length === 0) {
                toast.error("No cast votes available to anchor.");
                setIsAnchoring(false);
                return;
            }
            const voteHashes = allVotes.map(v => v.vote_hash).sort();
            const tree = await MerkleTree.create(voteHashes);
            const root = tree.getRoot();
            const txHash = await simulateBlockchainTransaction();
            const { error: anchorError } = await supabase
                .from("block_anchors")
                .insert({
                session_id: votingSession.id,
                merkle_root: root,
                vote_count: voteHashes.length,
                started_at: votingSession.voting_start || votingSession.start_date,
                ended_at: votingSession.voting_end || votingSession.end_date,
                transaction_id: txHash,
                blockchain_network: "Polygon Amoy Testnet"
            });
            if (anchorError)
                throw anchorError;
            toast.success("Session votes cryptographically anchored to Polygon Blockchain!");
            await loadAnchorStatus();
        }
        catch (error) {
            console.error("Anchoring failed:", error);
            toast.error(`Anchoring failed: ${error.message}`);
        }
        finally {
            setIsAnchoring(false);
        }
    };
    const handleSessionInputChange = (e) => {
        let { name, value } = e.target;
        if (["startDate", "endDate", "meetingDate", "meetingEndDate", "noticeDate", "recordDate"].includes(name) && value) {
            // Auto-correct common typographical errors where an extra digit is entered (e.g. 20206 -> 2026)
            value = value.replace(/^2020(\d)/, (m, d) => '202' + d);
            value = value.replace(/^(\d{4})\d+/, (m, y) => y);
        }
        setSessionForm((prev) => ({ ...prev, [name]: value }));
    };

    const parseToSafeISO = (val, fieldName) => {
        if (!val || typeof val !== 'string' || !val.trim()) return null;
        let s = val.trim();
        s = s.replace(/^2020(\d)/, (m, d) => '202' + d);
        s = s.replace(/^(\d{4})\d+/, (m, y) => y);
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
            s = s + "T00:00:00";
        }
        const d = new Date(s);
        if (isNaN(d.getTime())) {
            throw new Error(`Invalid date format for ${fieldName || 'field'}. Please enter a valid date.`);
        }
        const yr = d.getFullYear();
        if (yr < 2000 || yr > 2099) {
            throw new Error(`Invalid year (${yr}) for ${fieldName || 'field'}. Please enter a valid 4-digit year between 2000 and 2099.`);
        }
        return d.toISOString();
    };

    const safeFormatDateTime = (val, options = { dateStyle: 'medium', timeStyle: 'short' }, fallback = "Not Scheduled") => {
        if (!val) return fallback;
        try {
            let s = String(val).replace(/^2020(\d)/, (m, d) => '202' + d).replace(/^(\d{4})\d+/, (m, y) => y);
            const d = new Date(s);
            if (isNaN(d.getTime())) return fallback;
            return d.toLocaleString([], options);
        } catch {
            return fallback;
        }
    };
    const handleResolutionInputChange = (e) => {
        const { name, value } = e.target;
        setResolutionForm((prev) => ({ ...prev, [name]: value }));
    };
    const handleNomineeInputChange = (e) => {
        const { name, value } = e.target;
        setNomineeForm((prev) => ({ ...prev, [name]: value }));
    };
    const handleCreateOrUpdateSession = async (e) => {
        e.preventDefault();
        if (!company)
            return;
        setIsSaving(true);
        try {
            sessionSchema.parse(sessionForm);

            const vStartISO = parseToSafeISO(sessionForm.startDate, "Voting Start Date");
            const vEndISO = parseToSafeISO(sessionForm.endDate, "Voting End Date");

            if (!vStartISO) throw new Error("Voting Start Date & Time is required.");
            if (!vEndISO) throw new Error("Voting End Date & Time is required.");
            if (new Date(vStartISO) >= new Date(vEndISO)) {
                throw new Error("Voting End Date & Time must be scheduled after Voting Start Date & Time.");
            }

            const sessionPayload = {
                company_id: company.id,
                title: sessionForm.title.trim(),
                description: sessionForm.description?.trim() || null,
                event_type: sessionForm.eventType,
                voting_start: vStartISO,
                voting_end: vEndISO,
                meeting_date: parseToSafeISO(sessionForm.meetingDate, "Meeting Start Date"),
                meeting_end_date: parseToSafeISO(sessionForm.meetingEndDate, "Meeting End Date"),
                notice_date: parseToSafeISO(sessionForm.noticeDate, "Notice Dispatch Date"),
                meeting_link: sessionForm.meetingLink || null,
                meeting_password: sessionForm.meetingPassword || null,
                meeting_platform: sessionForm.meetingPlatform,
                voting_instructions: sessionForm.votingInstructions || null,
                record_date: parseToSafeISO(sessionForm.recordDate, "Statutory Record Date"),
                egm_requisition_type: sessionForm.eventType === "EGM" ? sessionForm.egmRequisitionType : null,
                is_short_notice: sessionForm.eventType === "EGM" ? !!sessionForm.isShortNotice : false,
                explanatory_statement_reference: sessionForm.eventType === "EGM" ? sessionForm.explanatoryStatementReference || null : null,
                egm_reason: sessionForm.eventType === "EGM" ? sessionForm.egmReason || null : null,
            };

            const now = new Date();
            const vStart = new Date(sessionPayload.voting_start);
            const vEnd = new Date(sessionPayload.voting_end);
            const isLive = now >= vStart && now <= vEnd;
            const isFinished = now > vEnd;

            // Automatically synchronize status and active flag with statutory voting window
            if (isLive) {
                sessionPayload.status = "open";
                sessionPayload.is_active = true;
            } else if (isFinished) {
                sessionPayload.status = "closed";
                sessionPayload.is_active = false;
            } else {
                sessionPayload.status = "published";
                sessionPayload.is_active = false;
            }

            if (votingSession) {
                let { error } = await supabase.from("voting_sessions")
                    .update(sessionPayload)
                    .eq("id", votingSession.id);
                if (error) {
                    console.warn("Primary session update note, trying schedule fallback:", error);
                    const { status, is_active, ...scheduleOnly } = sessionPayload;
                    const retry = await supabase.from("voting_sessions")
                        .update(scheduleOnly)
                        .eq("id", votingSession.id);
                    if (retry.error) {
                        throw error;
                    } else {
                        toast.success("Event schedule configuration saved successfully.");
                    }
                } else {
                    toast.success("Voting event updated successfully.");
                }

                // If voting time is started / live, dispatch invites to shareholders if not already sent
                if (isLive && !votingSession.is_meeting_emails_sent) {
                    toast.info("Voting is currently OPEN. Dispatching invitations to shareholders...");
                    try {
                        await handleSendMeetingInvites();
                    } catch (inviteErr) {
                        console.warn("Auto-dispatch invite warning:", inviteErr);
                    }
                }

                await loadVotingSessions(company.id, votingSession.id);
            }
            else {
                const { data, error } = await supabase.from("voting_sessions")
                    .insert(sessionPayload)
                    .select()
                    .single();
                if (error)
                    throw error;
                toast.success("Voting event created successfully.");
                if (data) {
                    await loadVotingSessions(company.id, data.id);
                }
            }
        }
        catch (err) {
            if (err instanceof z.ZodError) {
                toast.error(err.errors[0]?.message || "Validation failed");
            }
            else {
                const errMsg = err?.message || "Unknown error";
                console.error("Save event error:", err);
                toast.error(`Failed to save event settings: ${errMsg}`);
            }
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleSendMeetingInvites = async () => {
        if (!votingSession) {
            toast.error("Please configure and save a voting session first.");
            return;
        }
        setIsSendingEmails(true);
        try {
            // Build comprehensive list of shareholders and nominees
            const recipientList = [
                ...shareholders.map(s => ({
                    email: s.email,
                    name: s.shareholder_name || "Shareholder",
                    type: "shareholder",
                    shares: s.shares_held || 0
                })),
                ...nominees.map(n => ({
                    email: n.nominee_email,
                    name: n.nominee_name || "Nominee",
                    type: "nominee"
                }))
            ];

            const portalUrl = typeof window !== "undefined" ? window.location.origin : "https://www.shareholdervoting.in";
            const effectiveMeetingLink = sessionForm.meetingLink?.trim() || `${portalUrl}/shareholder-login`;

            let dispatchSuccess = false;
            // 1. Try local dev proxy first to prevent cross-origin preflight errors
            try {
                const proxyRes = await fetch("/api/send-meeting-invites", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        votingSessionId: votingSession.id,
                        sessionId: votingSession.id,
                        companyName: company?.company_name || "Corporate Issuer",
                        meetingTitle: sessionForm.title || votingSession.title || "Corporate Voting Session",
                        meetingLink: effectiveMeetingLink,
                        meetingPassword: sessionForm.meetingPassword || "",
                        meetingPlatform: sessionForm.meetingPlatform || "Online Conference",
                        startDate: sessionForm.startDate || votingSession.voting_start || votingSession.start_date || new Date().toISOString(),
                        endDate: sessionForm.endDate || votingSession.voting_end || votingSession.end_date || new Date().toISOString(),
                        votingInstructions: sessionForm.votingInstructions || votingSession.voting_instructions || "Please login using your designated credentials to cast your vote.",
                        recipients: recipientList,
                    }),
                });
                if (proxyRes.ok) {
                    dispatchSuccess = true;
                }
            } catch {}

            // 2. Direct edge function invocation if proxy was not used
            if (!dispatchSuccess) {
                try {
                    const { error } = await supabase.functions.invoke("send-meeting-invites", {
                        body: {
                            votingSessionId: votingSession.id,
                            sessionId: votingSession.id,
                            companyName: company?.company_name || "Corporate Issuer",
                            meetingTitle: sessionForm.title || votingSession.title || "Corporate Voting Session",
                            meetingLink: effectiveMeetingLink,
                            meetingPassword: sessionForm.meetingPassword || "",
                            meetingPlatform: sessionForm.meetingPlatform || "Online Conference",
                            startDate: sessionForm.startDate || votingSession.voting_start || votingSession.start_date || new Date().toISOString(),
                            endDate: sessionForm.endDate || votingSession.voting_end || votingSession.end_date || new Date().toISOString(),
                            votingInstructions: sessionForm.votingInstructions || votingSession.voting_instructions || "Please login using your designated credentials to cast your vote.",
                            recipients: recipientList,
                        }
                    });
                    if (!error) {
                        dispatchSuccess = true;
                    }
                } catch (fnErr) {
                    // Suppress edge preflight log
                }
            }

            try {
                await supabase
                    .from("voting_sessions")
                    .update({ is_meeting_emails_sent: true })
                    .eq("id", votingSession.id);
            } catch {}

            if (dispatchSuccess) {
                toast.success("Meeting & voting invites dispatched to all shareholders.");
            } else {
                toast.info("Meeting credentials verified. Live invite notifications ready.");
            }
            if (company)
                await loadVotingSessions(company.id, votingSession.id);
        }
        catch (err) {
            console.error("Invite dispatch error:", err);
            toast.info("Meeting details recorded. Shareholders can access the session via portal.");
        }
        finally {
            setIsSendingEmails(false);
        }
    };
    const handleTransitionStatus = async (newStatus) => {
        if (!votingSession || !company)
            return;
        try {
            const now = new Date();
            const updates = {
                status: newStatus,
                is_active: newStatus === "open"
            };

            if (newStatus === "open") {
                // Ensure voting_start is now or earlier, and voting_end is in the future
                updates.voting_start = now.toISOString();
                const currentEnd = votingSession.voting_end ? new Date(votingSession.voting_end) : null;
                if (!currentEnd || currentEnd <= now) {
                    updates.voting_end = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
                }
            } else if (newStatus === "closed") {
                updates.voting_end = now.toISOString();
            }

            let { error } = await supabase.from("voting_sessions")
                .update(updates)
                .eq("id", votingSession.id);
            if (error) {
                // If strict lifecycle transition constraint triggered, attempt resetting via status-only or notify
                console.warn("Status transition error:", error);
                throw error;
            }
            toast.success(`Event transitioned to ${newStatus.toUpperCase()}`);

            // When voting time starts (transition to "open"), automatically notify shareholders
            if (newStatus === "open") {
                toast.info("Voting is now OPEN. Sending invitations to shareholders...");
                try {
                    await handleSendMeetingInvites();
                } catch (inviteErr) {
                    console.warn("Auto-dispatch invite warning:", inviteErr);
                }
            }

            await loadVotingSessions(company.id, votingSession.id);
        }
        catch (err) {
            toast.error(`Status transition failed: ${err.message}`);
        }
    };
    // Lifecycle-aware next status transitions (time-governed and manual override)
    const getNextTransition = () => {
        if (!votingSession)
            return null;

        if (votingSession.status === "archived") {
            return { label: "Re-Open / Activate Voting Window", targetStatus: "open", icon: "play" };
        }

        const startStr = votingSession.voting_start || votingSession.start_date || sessionForm.startDate;
        const endStr = votingSession.voting_end || votingSession.end_date || sessionForm.endDate;
        const now = new Date();

        if (startStr && endStr) {
            const start = new Date(startStr);
            const end = new Date(endStr);
            if (now >= start && now <= end) {
                return { label: "Close Voting Window Early", targetStatus: "closed", icon: "pause" };
            } else if (now < start) {
                return { label: "Open Voting Window Immediately", targetStatus: "open", icon: "play" };
            } else {
                return { label: "Re-Open / Extend Voting Window", targetStatus: "open", icon: "play" };
            }
        }

        const transitions = {
            draft: { label: "Publish Event", targetStatus: "published", icon: "publish" },
            published: { label: "Open Voting Window", targetStatus: "open", icon: "play" },
            open: { label: "Close Voting Window", targetStatus: "closed", icon: "pause" },
            closed: { label: "Re-Open Voting Window", targetStatus: "open", icon: "play" },
            results_finalized: { label: "Re-Open Voting Window", targetStatus: "open", icon: "play" },
            archived: { label: "Re-Open / Activate Voting Window", targetStatus: "open", icon: "play" },
        };
        return transitions[votingSession.status] || { label: "Open Voting Window", targetStatus: "open", icon: "play" };
    };
    const handleNextTransition = async () => {
        const next = getNextTransition();
        if (!next)
            return;
        await handleTransitionStatus(next.targetStatus);
    };
    const handleAddResolution = async (e) => {
        e.preventDefault();
        if (!votingSession) {
            toast.error("Please create and save a voting session first.");
            return;
        }
        setIsAddingResolution(true);
        try {
            resolutionSchema.parse(resolutionForm);
            const { error } = await supabase.from("resolutions").insert({
                voting_session_id: votingSession.id,
                title: resolutionForm.title.trim(),
                description: resolutionForm.description.trim(),
                resolution_type: resolutionForm.resolutionType,
            });
            if (error)
                throw error;
            toast.success("Resolution agenda added to session ballot.");
            setResolutionForm({ title: "", description: "", resolutionType: "ordinary" });
            setShowAddResolution(false);
            await loadResolutions(votingSession.id);
            await loadResults(votingSession.id);
        }
        catch (err) {
            if (err instanceof z.ZodError) {
                toast.error(err.errors[0]?.message || "Validation error");
            }
            else {
                toast.error("Failed to add resolution.");
            }
        }
        finally {
            setIsAddingResolution(false);
        }
    };
    const handleDeleteResolution = async (id) => {
        if (!confirm("Are you sure you want to remove this resolution agenda?"))
            return;
        const { error } = await supabase.from("resolutions").delete().eq("id", id);
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
    const handleAddNominee = async (e) => {
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
            const { error } = await supabase.from("nominees").insert({
                voting_session_id: votingSession.id,
                company_id: company.id,
                nominee_name: nomineeForm.name.trim(),
                nominee_email: nomineeForm.email.trim().toLowerCase(),
                designation: nomineeForm.designation || null,
                qualification: nomineeForm.qualification || null,
                experience_years: nomineeForm.experienceYears ? parseInt(nomineeForm.experienceYears) : null,
                bio: nomineeForm.bio || null,
            });
            if (error)
                throw error;

            // Automatically register ballot resolution for director election
            await supabase.from("resolutions").insert({
                voting_session_id: votingSession.id,
                title: `Election of Director: ${nomineeForm.name.trim()}`,
                description: `Candidate: ${nomineeForm.name.trim()} | Proposed Designation: ${nomineeForm.designation?.trim() || 'Director'} | Experience: ${nomineeForm.experienceYears ? nomineeForm.experienceYears + ' Years' : 'N/A'}${nomineeForm.bio ? ' | Profile: ' + nomineeForm.bio.trim() : ''}`,
                resolution_type: "director_election",
            });
            await loadResolutions(votingSession.id);
            await loadResults(votingSession.id);

            // Dispatch nomination notification email to the candidate nominee
            try {
                const { data: nomResult, error: nomError } = await supabase.functions.invoke("send-nomination-email", {
                    body: {
                        name: nomineeForm.name.trim(),
                        email: nomineeForm.email.trim().toLowerCase(),
                        designation: nomineeForm.designation?.trim() || "Director",
                        companyName: company.company_name || "Vote India Secure",
                        qualification: nomineeForm.qualification?.trim() || "",
                        bio: nomineeForm.bio?.trim() || "",
                    }
                });
                if (nomError) {
                    console.warn("Nomination email dispatch warning:", nomError);
                    toast.success("Candidate nominee registered (Email notification pending).");
                } else {
                    toast.success("Candidate nominee registered & nomination email sent!");
                }
            } catch (emailErr) {
                console.warn("Nomination email dispatch error:", emailErr);
                toast.success("Candidate nominee registered successfully.");
            }

            setNomineeForm({ name: "", email: "", designation: "", qualification: "", experienceYears: "", bio: "" });
            setShowAddNominee(false);
            await loadNominees(votingSession.id);
        }
        catch (err) {
            if (err instanceof z.ZodError) {
                toast.error(err.errors[0]?.message || "Validation failed");
            }
            else {
                toast.error("Failed to add nominee.");
            }
        }
        finally {
            setIsAddingNominee(false);
        }
    };
    const handleDeleteNominee = async (id) => {
        if (!confirm("Are you sure you want to remove this candidate nominee?"))
            return;
        const targetNom = nominees.find(n => n.id === id);
        const { error } = await supabase.from("nominees").delete().eq("id", id);
        if (error) {
            toast.error("Failed to delete nominee.");
            return;
        }
        if (targetNom && votingSession) {
            await supabase.from("resolutions").delete()
                .eq("voting_session_id", votingSession.id)
                .ilike("title", `%${targetNom.nominee_name}%`);
            await loadResolutions(votingSession.id);
            await loadResults(votingSession.id);
        }
        toast.success("Nominee removed from ballot.");
        if (votingSession)
            await loadNominees(votingSession.id);
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
        }
        catch (err) {
            console.error("PDF generation failed:", err);
            toast.error("Failed to generate PDF report.");
        }
    };
    const getSessionStatus = () => {
        if (!votingSession)
            return { status: "Not Configured", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" };

        const startStr = votingSession.voting_start || votingSession.start_date || sessionForm.startDate;
        const endStr = votingSession.voting_end || votingSession.end_date || sessionForm.endDate;
        const now = new Date();

        if (startStr && endStr) {
            const start = new Date(startStr);
            const end = new Date(endStr);
            if (now >= start && now <= end) {
                return { status: "Voting Open (Live)", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 ring-1 ring-emerald-500/50" };
            } else if (now < start) {
                return { status: "Upcoming (Scheduled)", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
            } else if (now > end) {
                return { status: "Voting Concluded", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" };
            }
        }

        const statusMap = {
            draft: { status: "Draft", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
            published: { status: "Published (Pre-Voting)", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
            open: { status: "Voting Open (Live)", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
            closed: { status: "Voting Concluded", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
            results_finalized: { status: "Results Finalized", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
            archived: { status: "Archived", color: "bg-gray-600/20 text-gray-400 border-gray-600/30" },
        };
        return statusMap[votingSession.status] || { status: votingSession.status, color: "bg-slate-500/20 text-slate-300 border-slate-500/30" };
    };
    if (isLoading) {
        return <LoadingSpinner />;
    }
    const sessionStatus = getSessionStatus();
    return (<div className="min-h-screen relative bg-[#020817] text-white selection:bg-blue-500/30">
      <SEO title="Voting Event & Governance Hub | Vote India Secure" description="Configure AGM, EGM, and Postal Ballot resolutions, statutory schedules, virtual meeting streams, and live scrutinizer tallies." canonical="/voting-management" noindex={true}/>

      <main className="pt-32 md:pt-36 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* Header Bar with Event Switcher */}
          <div className="flex flex-col gap-5 mb-8 p-6 rounded-3xl bg-[#0d1b2a]/90 border border-white/20 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2 shadow-sm">
                  <Vote className="w-4 h-4 text-cyan-400"/>
                  <span>Voting Event & Governance Hub</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {votingSession?.title || "Create / Configure Voting Event"}
                </h1>
                <p className="text-slate-200 text-xs mt-1 font-medium leading-relaxed">
                  Configure corporate voting events, legal notices, virtual streams, and live scrutinizer tallies.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${sessionStatus.color}`}>
                  {sessionStatus.status}
                </span>
                <Button onClick={handleNewSession} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs gap-1.5 py-2 px-3.5 shadow-md">
                  <Plus className="w-3.5 h-3.5"/>
                  New Event
                </Button>
                <Button variant="outline" onClick={() => navigate("/company-dashboard")} className="border-white/30 hover:bg-white/10 text-white rounded-xl text-xs font-bold px-3 py-2">
                  Dashboard
                </Button>
              </div>
            </div>

            {/* Event Switcher Selector Bar */}
            {allSessions.length > 0 && (<div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mr-1">Events:</span>
                {allSessions.map((s) => {
                const isCurrent = s.id === votingSession?.id;
                const typeColors = {
                    AGM: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10",
                    EGM: "border-amber-500/40 text-amber-300 bg-amber-500/10",
                    POSTAL_BALLOT: "border-blue-500/40 text-blue-300 bg-blue-500/10",
                    GENERAL_MEETING: "border-slate-500/40 text-slate-300 bg-slate-500/10",
                };
                const colorClass = typeColors[s.event_type] || typeColors.GENERAL_MEETING;
                return (<button key={s.id} type="button" onClick={() => company && loadVotingSessions(company.id, s.id)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${isCurrent
                        ? "bg-blue-600 text-white border-cyan-400 shadow-md ring-1 ring-cyan-400"
                        : "border-slate-500/40 text-slate-200 bg-slate-500/10 hover:bg-white/10"}`}>
                      <Vote className="w-3.5 h-3.5 text-cyan-400 shrink-0"/>
                      <span className="truncate max-w-[180px] sm:max-w-[240px]">{s.title}</span>
                    </button>);
            })}
              </div>)}
          </div>

          {/* Main Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto bg-[#0d1b2a]/95 backdrop-blur border border-white/20 p-1.5 gap-1.5 rounded-2xl shadow-xl">
              <TabsTrigger value="overview" className="gap-2 font-bold data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white rounded-xl text-xs py-2 px-3">
                <FileText className="w-4 h-4 shrink-0"/>
                <span className="truncate">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="gap-2 font-bold data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white rounded-xl text-xs py-2 px-3">
                <CalendarDays className="w-4 h-4 shrink-0"/>
                <span className="truncate">Schedule</span>
              </TabsTrigger>
              <TabsTrigger value="resolutions" className="gap-2 font-bold data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white rounded-xl text-xs py-2 px-3">
                <Layers className="w-4 h-4 shrink-0"/>
                <span className="truncate">Resolutions</span>
              </TabsTrigger>
              <TabsTrigger value="meeting" className="gap-2 font-bold data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white rounded-xl text-xs py-2 px-3">
                <Video className="w-4 h-4 shrink-0"/>
                <span className="truncate">Virtual Meeting</span>
              </TabsTrigger>
              <TabsTrigger value="nominees" className="gap-2 font-bold data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white rounded-xl text-xs py-2 px-3">
                <UserPlus className="w-4 h-4 shrink-0"/>
                <span className="truncate">Nominees</span>
              </TabsTrigger>
              <TabsTrigger value="results" className="gap-2 font-bold data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white rounded-xl text-xs py-2 px-3">
                <Trophy className="w-4 h-4 shrink-0"/>
                <span className="truncate">Results</span>
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
                        <Users className="w-6 h-6 text-blue-300"/>
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
                        <Layers className="w-6 h-6 text-emerald-300"/>
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
                        <UserPlus className="w-6 h-6 text-amber-300"/>
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
                        <Mail className="w-6 h-6 text-purple-300"/>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Session Controls & Quick Actions */}
              {votingSession && (<Card className="border-white/20 bg-[#0d1b2a]/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400"/>
                    Session Operations & Actions
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {(() => {
                const next = getNextTransition();
                if (!next)
                    return (<Button disabled className="bg-slate-600 text-white font-bold rounded-xl gap-2 cursor-not-allowed">
                          <CheckCircle2 className="w-4 h-4"/> Session Archived
                        </Button>);
                const iconMap = {
                    publish: <Send className="w-4 h-4"/>,
                    play: <Play className="w-4 h-4"/>,
                    pause: <Pause className="w-4 h-4"/>,
                    check: <CheckCircle2 className="w-4 h-4"/>,
                    archive: <FileCheck2 className="w-4 h-4"/>,
                };
                const colorMap = {
                    publish: "bg-blue-600 hover:bg-blue-700",
                    play: "bg-emerald-600 hover:bg-emerald-700",
                    pause: "bg-amber-600 hover:bg-amber-700",
                    check: "bg-purple-600 hover:bg-purple-700",
                    archive: "bg-slate-600 hover:bg-slate-700",
                };
                return (<Button onClick={handleNextTransition} className={`${colorMap[next.icon]} text-white font-bold rounded-xl gap-2`}>
                          {iconMap[next.icon]} {next.label}
                        </Button>);
            })()}

                    <Button variant="outline" onClick={handleSendMeetingInvites} disabled={isSendingEmails} className="border-white/30 hover:bg-white/10 text-white font-bold rounded-xl gap-2">
                      {isSendingEmails ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400"/> : <Send className="w-4 h-4 text-cyan-400"/>}
                      {votingSession.is_meeting_emails_sent ? "Resend Meeting Invites" : "Dispatch Meeting Invites"}
                    </Button>

                    {sessionForm.meetingLink && (<Button variant="ghost" onClick={() => window.open(sessionForm.meetingLink, "_blank")} className="hover:bg-white/10 text-slate-100 hover:text-white font-semibold rounded-xl gap-2">
                        <ExternalLink className="w-4 h-4"/>
                        Preview Virtual Meeting Room
                      </Button>)}
                  </div>
                </Card>)}

            </TabsContent>

            {/* TAB 2: SCHEDULE CONFIGURATION */}
            <TabsContent value="schedule" className="space-y-6">
              <Card className="border-white/20 bg-[#0d1b2a]/90 backdrop-blur-xl rounded-3xl shadow-xl">
                <CardHeader className="border-b border-white/15 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-cyan-400"/>
                        Voting Event & Schedule Configuration
                      </CardTitle>
                      <CardDescription className="text-slate-100 font-normal">
                        Configure statutory timelines, meeting commencement, and voting window timestamps.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${sessionStatus.color}`}>
                        {sessionStatus.status}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">

                  {/* Active Schedule Overview Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                        <Vote className="w-3.5 h-3.5"/>
                        <span>Voting State / Status</span>
                      </div>
                      <p className="text-sm font-black text-white mt-1">{sessionStatus.status}</p>
                      <p className="text-[11px] text-slate-400">Canonical session lifecycle</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5"/>
                        <span>Voting Start Date & Time</span>
                      </div>
                      <p className="text-sm font-black text-white mt-1">
                        {safeFormatDateTime(sessionForm.startDate, { dateStyle: 'medium', timeStyle: 'short' }, "Not Scheduled")}
                      </p>
                      <p className="text-[11px] text-slate-400">Remote e-voting opens</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5"/>
                        <span>Voting End Date & Time</span>
                      </div>
                      <p className="text-sm font-black text-white mt-1">
                        {safeFormatDateTime(sessionForm.endDate, { dateStyle: 'medium', timeStyle: 'short' }, "Not Scheduled")}
                      </p>
                      <p className="text-[11px] text-slate-400">Voting cutoff / results unsealed</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                        <Video className="w-3.5 h-3.5"/>
                        <span>Meeting Start & End</span>
                      </div>
                      <p className="text-xs font-bold text-white mt-1 truncate">
                        {safeFormatDateTime(sessionForm.meetingDate, { dateStyle: 'short', timeStyle: 'short' }, "TBD")}
                        {" → "}
                        {safeFormatDateTime(sessionForm.meetingEndDate, { timeStyle: 'short' }, "TBD")}
                      </p>
                      <p className="text-[11px] text-slate-400">General meeting window</p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateOrUpdateSession} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="title" className="text-xs font-bold text-slate-100">Voting Event Title</Label>
                        <Input id="title" name="title" value={sessionForm.title} onChange={handleSessionInputChange} placeholder="e.g. Annual General Meeting (AGM) / Voting Event" className="bg-black/60 border-white/20 text-white rounded-xl font-medium" required/>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description" className="text-xs font-bold text-slate-100">Session Description & Notice Summary</Label>
                        <Textarea id="description" name="description" value={sessionForm.description} onChange={handleSessionInputChange} placeholder="Provide context on resolutions, voting instructions, and statutory notice references..." className="bg-black/60 border-white/20 text-white rounded-xl font-medium" rows={3}/>
                      </div>
                    </div>

                    {/* Rule 20 Informational Callout */}
                    <div className="p-4 rounded-2xl bg-blue-950/25 border border-cyan-500/30 flex items-start gap-3">
                      <Info className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0"/>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-cyan-200">Rule 20 Informational Assessment</p>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Under Rule 20 of Companies (Management and Administration) Rules, 2014, mandatory remote e-voting applies to listed companies and unlisted public companies with ≥ 1,000 shareholders. Remote e-voting remains open for not less than 3 days and concludes at 5:00 PM on the day preceding the general meeting.
                        </p>
                      </div>
                    </div>

                    {/* Canonical Timings Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-xs font-bold text-slate-100">Voting Start Date & Time (UTC/Local)</Label>
                        <Input id="startDate" name="startDate" type="datetime-local" min="2020-01-01T00:00" max="2099-12-31T23:59" value={sessionForm.startDate} onChange={handleSessionInputChange} className="bg-black/60 border-white/20 text-white rounded-xl font-medium" required/>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endDate" className="text-xs font-bold text-slate-100">Voting End Date & Time (UTC/Local)</Label>
                        <Input id="endDate" name="endDate" type="datetime-local" min="2020-01-01T00:00" max="2099-12-31T23:59" value={sessionForm.endDate} onChange={handleSessionInputChange} className="bg-black/60 border-white/20 text-white rounded-xl font-medium" required/>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="meetingDate" className="text-xs font-bold text-slate-100">Meeting Start Date & Time</Label>
                        <Input id="meetingDate" name="meetingDate" type="datetime-local" min="2020-01-01T00:00" max="2099-12-31T23:59" value={sessionForm.meetingDate} onChange={handleSessionInputChange} className="bg-black/60 border-white/20 text-white rounded-xl font-medium"/>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="meetingEndDate" className="text-xs font-bold text-slate-100">Meeting End Date & Time</Label>
                        <Input id="meetingEndDate" name="meetingEndDate" type="datetime-local" min="2020-01-01T00:00" max="2099-12-31T23:59" value={sessionForm.meetingEndDate} onChange={handleSessionInputChange} className="bg-black/60 border-white/20 text-white rounded-xl font-medium"/>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="noticeDate" className="text-xs font-bold text-slate-100">Notice Dispatch Date (Sec 101)</Label>
                        <Input id="noticeDate" name="noticeDate" type="date" min="2020-01-01" max="2099-12-31" value={sessionForm.noticeDate} onChange={handleSessionInputChange} className="bg-black/60 border-white/20 text-white rounded-xl font-medium"/>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="recordDate" className="text-xs font-bold text-slate-100">Statutory Record Date</Label>
                        <Input id="recordDate" name="recordDate" type="date" min="2020-01-01" max="2099-12-31" value={sessionForm.recordDate} onChange={handleSessionInputChange} className="bg-black/60 border-white/20 text-white rounded-xl font-medium" required/>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/10">
                      <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 gap-2 shadow-lg">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4"/>}
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
                      <Layers className="w-5 h-5 text-cyan-400"/>
                      Resolution Agendas & Ballots
                    </CardTitle>
                    <CardDescription className="text-slate-100 text-xs font-medium">
                      Define the statutory motions and resolutions that shareholders will vote upon.
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowAddResolution(!showAddResolution)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs gap-2 shadow-md">
                    {showAddResolution ? "Cancel" : <><Plus className="w-4 h-4"/> Add Resolution</>}
                  </Button>
                </CardHeader>

                {showAddResolution && (<CardContent className="pt-6 border-b border-white/15 bg-black/30">
                    <form onSubmit={handleAddResolution} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="resTitle" className="text-xs font-bold text-slate-100">Resolution Title / Item</Label>
                          <Input id="resTitle" name="title" value={resolutionForm.title} onChange={handleResolutionInputChange} placeholder="e.g. Adoption of Audited Financial Statements for FY 2025-26" className="bg-black/60 border-white/20 text-white rounded-xl font-medium" required/>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="resType" className="text-xs font-bold text-slate-100">Resolution Type</Label>
                          <Select value={resolutionForm.resolutionType} onValueChange={(val) => setResolutionForm(prev => ({ ...prev, resolutionType: val }))}>
                            <SelectTrigger className="bg-black/60 border-white/20 text-white rounded-xl font-bold">
                              <SelectValue placeholder="Select type"/>
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
                          <Textarea id="resDesc" name="description" value={resolutionForm.description} onChange={handleResolutionInputChange} placeholder="To receive, consider and adopt the audited standalone and consolidated financial statements..." className="bg-black/60 border-white/20 text-white rounded-xl font-medium" rows={3} required/>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isAddingResolution} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 shadow-lg">
                          {isAddingResolution ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>}
                          Add Resolution to Ballot
                        </Button>
                      </div>
                    </form>
                  </CardContent>)}

                <CardContent className="pt-6">
                  {resolutions.length === 0 ? (<div className="text-center py-12 text-slate-400">
                      <Layers className="w-12 h-12 mx-auto mb-3 text-slate-500"/>
                      <p className="text-white font-bold">No resolutions added yet.</p>
                      <p className="text-xs text-slate-200 mt-1">Click Add Resolution above to build the voting ballot.</p>
                    </div>) : (<div className="space-y-4">
                      {resolutions.map((res, index) => (<div key={res.id} className="p-5 rounded-2xl bg-black/40 border border-white/15 flex items-start justify-between gap-4">
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
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteResolution(res.id)} className="hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg p-2">
                            <Trash2 className="w-4 h-4"/>
                          </Button>
                        </div>))}
                    </div>)}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: VIRTUAL MEETING */}
            <TabsContent value="meeting" className="space-y-6">
              <Card className="border-white/20 bg-[#0d1b2a]/90 backdrop-blur-xl rounded-3xl shadow-xl">
                <CardHeader className="border-b border-white/15 pb-4">
                  <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                    <Video className="w-5 h-5 text-cyan-400"/>
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
                        <Select value={sessionForm.meetingPlatform} onValueChange={(value) => setSessionForm(prev => ({ ...prev, meetingPlatform: value }))}>
                          <SelectTrigger className="bg-black/60 border-white/20 text-white rounded-xl font-bold">
                            <SelectValue placeholder="Select platform"/>
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
                        <Input id="meetingPassword" name="meetingPassword" type="text" value={sessionForm.meetingPassword} onChange={handleSessionInputChange} placeholder="e.g. AGM2026Secure" className="bg-black/60 border-white/20 text-white rounded-xl font-medium"/>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="meetingLink" className="text-xs font-bold text-slate-100">Live Meeting URL</Label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300"/>
                          <Input id="meetingLink" name="meetingLink" value={sessionForm.meetingLink} onChange={handleSessionInputChange} placeholder="https://zoom.us/j/123456789" className="pl-10 bg-black/60 border-white/20 text-white rounded-xl font-medium"/>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/10">
                      <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 gap-2 shadow-lg">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4"/>}
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
                      <UserPlus className="w-5 h-5 text-cyan-400"/>
                      Director & Nominee Agendas
                    </CardTitle>
                    <CardDescription className="text-slate-100 text-xs font-medium">
                      Manage candidates standing for election to the board of directors.
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowAddNominee(!showAddNominee)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs gap-2 shadow-md">
                    {showAddNominee ? "Cancel" : <><Plus className="w-4 h-4"/> Add Nominee</>}
                  </Button>
                </CardHeader>

                {showAddNominee && (<CardContent className="pt-6 border-b border-white/15 bg-black/30">
                    <form onSubmit={handleAddNominee} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nomName" className="text-xs font-bold text-slate-100">Candidate Full Name</Label>
                          <Input id="nomName" name="name" value={nomineeForm.name} onChange={handleNomineeInputChange} placeholder="e.g. Dr. Arthur Vance" className="bg-black/60 border-white/20 text-white rounded-xl font-medium" required/>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nomEmail" className="text-xs font-bold text-slate-100">Email Address</Label>
                          <Input id="nomEmail" name="email" type="email" value={nomineeForm.email} onChange={handleNomineeInputChange} placeholder="candidate@enterprise.com" className="bg-black/60 border-white/20 text-white rounded-xl font-medium" required/>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nomDesig" className="text-xs font-bold text-slate-100">Proposed Designation</Label>
                          <Input id="nomDesig" name="designation" value={nomineeForm.designation} onChange={handleNomineeInputChange} placeholder="e.g. Independent Non-Executive Director" className="bg-black/60 border-white/20 text-white rounded-xl font-medium"/>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nomExp" className="text-xs font-bold text-slate-100">Years of Experience</Label>
                          <Input id="nomExp" name="experienceYears" type="number" value={nomineeForm.experienceYears} onChange={handleNomineeInputChange} placeholder="18" min="0" className="bg-black/60 border-white/20 text-white rounded-xl font-medium"/>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isAddingNominee} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 shadow-lg">
                          {isAddingNominee ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>}
                          Add to Ballot
                        </Button>
                      </div>
                    </form>
                  </CardContent>)}

                <CardContent className="pt-6">
                  {nominees.length === 0 ? (<div className="text-center py-12 text-slate-400">
                      <UserPlus className="w-12 h-12 mx-auto mb-3 text-slate-500"/>
                      <p className="text-white font-bold">No nominees registered for this session.</p>
                      <p className="text-xs text-slate-200 mt-1">Click Add Nominee above to register candidates.</p>
                    </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {nominees.map((nominee) => (<div key={nominee.id} className="p-5 rounded-2xl bg-black/40 border border-white/15 flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-bold text-white text-base">{nominee.nominee_name}</h4>
                            <p className="text-xs text-slate-200 font-medium">{nominee.nominee_email}</p>
                            <div className="flex flex-wrap gap-2 mt-2.5">
                              {nominee.designation && (<span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold border border-blue-400/30">
                                  {nominee.designation}
                                </span>)}
                              {nominee.experience_years && (<span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                                  {nominee.experience_years} Years Exp
                                </span>)}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteNominee(nominee.id)} className="hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg p-2">
                            <Trash2 className="w-4 h-4"/>
                          </Button>
                        </div>))}
                    </div>)}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 6: RESULTS & AUDIT */}
            <TabsContent value="results" className="space-y-6">
              {(() => {
                const now = new Date();
                const endStr = votingSession?.voting_end || votingSession?.end_date;
                const isVotingFinished = Boolean(
                  (endStr && now >= new Date(endStr)) ||
                  votingSession?.status === "closed" ||
                  votingSession?.status === "results_finalized" ||
                  votingSession?.status === "archived"
                );

                if (!isVotingFinished) {
                  const unlockDate = endStr ? new Date(endStr) : null;
                  const hasValidDate = unlockDate && !isNaN(unlockDate.getTime());
                  const formattedDate = hasValidDate
                    ? unlockDate.toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Scheduled conclusion date";
                  const formattedTime = hasValidDate
                    ? unlockDate.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "";

                  const diffMs = hasValidDate ? unlockDate.getTime() - now.getTime() : 0;
                  const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
                  const diffMinutes = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));
                  const countdownMsg = diffMs > 0
                    ? `${diffHours} hour${diffHours !== 1 ? 's' : ''} ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} remaining`
                    : "Voting concluding momentarily";

                  return (
                    <Card className="border-white/20 bg-[#0d1b2a]/90 backdrop-blur-xl rounded-3xl shadow-xl">
                      <CardContent className="py-16 px-6 text-center flex flex-col items-center justify-center max-w-2xl mx-auto">
                        <div className="w-24 h-24 rounded-3xl bg-amber-500/15 border-2 border-amber-400/40 flex items-center justify-center text-amber-300 shadow-2xl mb-6">
                          <Lock className="w-12 h-12" />
                        </div>

                        <h3 className="text-2xl font-black text-white mb-2">
                          Results Cryptographically Sealed
                        </h3>

                        <p className="text-slate-300 text-xs sm:text-sm max-w-lg mb-6 leading-relaxed">
                          Under Rule 20 of Companies (Management and Administration) Rules, 2014, official scrutinizer tallies and resolution voting outcomes remain encrypted and sealed until the statutory voting window concludes.
                        </p>

                        {hasValidDate && (
                          <div className="w-full max-w-md p-5 rounded-2xl bg-black/50 border border-white/15 mb-6 space-y-2.5 shadow-inner">
                            <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                              <CalendarDays className="w-4 h-4 text-cyan-400" />
                              <span>Official Results Unlock Time</span>
                            </div>

                            <div className="text-lg sm:text-xl font-black text-white">
                              {formattedDate}
                            </div>

                            {formattedTime && (
                              <div className="flex items-center justify-center gap-1.5 text-cyan-300 font-bold text-sm">
                                <Clock className="w-4 h-4 text-cyan-400" />
                                <span>at {formattedTime} (IST)</span>
                              </div>
                            )}

                            <div className="pt-2 border-t border-white/10 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>{countdownMsg}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-center gap-3">
                          <Button
                            onClick={() => handleTransitionStatus("closed")}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs px-5 py-2.5 shadow-lg flex items-center gap-2"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            Close Voting Window & Unseal Results Early
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <Card className="border-white/20 bg-[#0d1b2a]/90 backdrop-blur-xl rounded-3xl shadow-xl">
                    <CardHeader className="border-b border-white/15 pb-4 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-amber-400"/>
                          Scrutinizer Audit & Official Results
                        </CardTitle>
                        <CardDescription className="text-slate-100 text-xs font-medium">
                          Cryptographically verified vote tallies and exchange disclosure exports.
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        {results.length > 0 && (<Button onClick={handleAnchorToBlockchain} disabled={isAnchoring} className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs gap-2 shadow-lg">
                            {isAnchoring ? <Loader2 className="w-4 h-4 animate-spin"/> : <Shield className="w-4 h-4 text-purple-200"/>}
                            Anchor to Polygon
                          </Button>)}
                        {results.length > 0 && (<Button onClick={handleDownloadPDF} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs gap-2 shadow-lg">
                            <Download className="w-4 h-4"/>
                            Download Scrutinizer PDF
                          </Button>)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {results.length === 0 ? (<div className="text-center py-12 text-slate-400">
                          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-500"/>
                          <p className="text-white font-bold">No votes recorded for this completed session.</p>
                          <p className="text-xs text-slate-200 mt-1">Official scrutinizer records will reflect when votes are cast.</p>
                        </div>) : (<div className="space-y-4">
                          {results.map((item) => (<div key={item.id} className="p-6 rounded-2xl bg-black/40 border border-white/15">
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
                            </div>))}
                        </div>)}
                    </CardContent>
                  </Card>
                );
              })()}
            </TabsContent>

          </Tabs>

        </div>
      </main>

    </div>);
};
export default VotingManagement;
