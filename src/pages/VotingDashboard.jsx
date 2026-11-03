import { useState, useCallback, useEffect, useMemo, lazy, Suspense } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Vote, CheckCircle2, Clock, Shield, AlertCircle, LogOut, ChevronRight, Video, UserPlus, ShieldCheck, Activity, Layers, Hourglass, Lock, Trophy, Calendar } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/layout/SEO";
import { generateVoteHash } from "@/lib/blockchain";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import VotingCard from "@/components/voting/VotingCard";
const VotingAnalytics = lazy(() => import("@/components/dashboard/VotingAnalytics"));
import VotingCardSkeleton from "@/components/voting/VotingCardSkeleton";
import { votingApi } from "@/services/api/voting";
import { supabase } from "@/integrations/supabase/client";
import { ShareholderFeedbackForm } from "@/components/ai/ShareholderFeedbackForm";
import { useTranslation } from "react-i18next";
const AppointProxyCard = ({ shareholders, onDelegate, delegation, isDelegating }) => {
    const { t } = useTranslation();
    const [selectedProxyId, setSelectedProxyId] = useState("");
    if (delegation) {
        return (<Card className="border-indigo-500/30 bg-[#0d1b2a]/90 backdrop-blur-xl mb-8 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <ShieldCheck className="w-6 h-6"/>
            </div>
            <div>
              <h3 className="font-bold text-lg text-white mb-1">{t("voting_dash_proxy_appointed") || "Proxy Appointed Successfully"}</h3>
              <p className="text-sm text-slate-200">
                {t("voting_dash_delegated_to") || "Voting rights delegated to"}: <span className="font-bold text-white">{delegation.proxy?.shareholder_name}</span> ({delegation.proxy?.email})
              </p>
            </div>
          </div>
        </CardContent>
      </Card>);
    }
    return (<Card className="border-indigo-500/30 bg-[#0d1b2a]/90 backdrop-blur-xl mb-8 shadow-xl">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <UserPlus className="w-6 h-6"/>
            </div>
            <div>
              <h3 className="font-bold text-lg text-white mb-1">{t("voting_dash_appoint_proxy") || "Appoint a Voting Proxy"}</h3>
              <p className="text-sm text-slate-200 mb-4 font-normal">
                {t("voting_dash_appoint_desc") || "Authorize another registered shareholder to cast ballots on your behalf."}
              </p>
              <div className="flex flex-wrap gap-2">
                <select className="bg-black/60 border border-white/20 text-white rounded-xl px-3.5 py-2 text-xs font-bold max-w-[280px] focus:outline-none focus:ring-2 focus:ring-indigo-500" value={selectedProxyId} onChange={(e) => setSelectedProxyId(e.target.value)}>
                  <option value="">{t("voting_dash_select_sh") || "Select Proxy Shareholder..."}</option>
                  {shareholders?.map(s => (<option key={s.id} value={s.id}>{s.shareholder_name} ({s.email})</option>))}
                </select>
                <Button size="sm" disabled={!selectedProxyId || isDelegating} onClick={() => onDelegate(selectedProxyId)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs px-4">
                  {isDelegating ? (t("voting_dash_delegating") || "Appointing...") : (t("voting_dash_delegate_now") || "Confirm Proxy")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>);
};
const VotingDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    // 1. Fetch Shareholder Details from HttpOnly Cookie Session
    const { data: sessionAuth, isLoading: loadingAuth } = useQuery({
        queryKey: ["shareholder-session"],
        queryFn: () => votingApi.checkSession(),
    });
    const shareholder = sessionAuth?.shareholder;
    const shareholderId = shareholder?.id;
    useEffect(() => {
        if (!loadingAuth && sessionAuth && !sessionAuth.authenticated) {
            navigate("/shareholder-login");
        }
    }, [loadingAuth, sessionAuth, navigate]);
    const [searchParams, setSearchParams] = useSearchParams();
    const eventHint = searchParams.get("event");
    // 2. Fetch Eligible Voting Events (Server-Authoritative via HttpOnly session)
    const { data: eligibleEvents = [], isLoading: loadingEvents, error: eventsError } = useQuery({
        queryKey: ["eligible-events"],
        queryFn: () => votingApi.getEligibleEvents(),
        enabled: !!sessionAuth?.authenticated,
    });
    // Resolve active event from server-eligible list and URL navigation hint
    const activeEventSummary = useMemo(() => {
        if (!eligibleEvents.length)
            return null;
        if (eventHint) {
            const found = eligibleEvents.find(e => e.id === eventHint || e.session_id === eventHint);
            if (found)
                return found;
        }
        return eligibleEvents[0];
    }, [eligibleEvents, eventHint]);
    const activeSessionId = activeEventSummary?.id || activeEventSummary?.session_id;
    // 3. Fetch Event Details & Resolutions (Server-Authoritative)
    const { data: eventDetail, isLoading: loadingDetail, error: detailError } = useQuery({
        queryKey: ["event-detail", activeSessionId],
        queryFn: () => votingApi.getEventDetails(activeSessionId),
        enabled: !!activeSessionId,
    });
    // Canonical session alias & resolutions from server RPC
    const session = eventDetail || activeEventSummary;
    const resolutions = (eventDetail?.resolutions && eventDetail.resolutions.length > 0)
        ? eventDetail.resolutions
        : (activeEventSummary?.resolutions || []);
    const { data: existingVotes, isLoading: loadingVotes } = useQuery({
        queryKey: ["votes", shareholderId],
        queryFn: () => votingApi.getShareholderVotes(shareholderId),
        enabled: !!shareholderId,
    });
    // Live Countdown & Status (using canonical timing fields)
    const [currentTime, setCurrentTime] = useState(() => new Date());
    const [countdownText, setCountdownText] = useState("");
    const [isLiveNow, setIsLiveNow] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    useEffect(() => {
        if (!session)
            return;
        const checkWindow = () => {
            const now = new Date().getTime();
            const startStr = session.voting_start || session.start_date;
            const endStr = session.voting_end || session.end_date;
            if (!startStr || !endStr)
                return;
            const start = new Date(startStr).getTime();
            const end = new Date(endStr).getTime();
            if (now < start) {
                setIsLiveNow(false);
                const diff = start - now;
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                setCountdownText(`Voting window opens in ${hours}h ${mins}m ${secs}s`);
            }
            else if (now >= start && now <= end) {
                setIsLiveNow(true);
                const diff = end - now;
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                setCountdownText(`Voting closes in ${hours}h ${mins}m ${secs}s`);
            }
            else {
                setIsLiveNow(false);
                setCountdownText("Voting window has concluded");
            }
        };
        checkWindow();
        const interval = setInterval(checkWindow, 1000);
        return () => clearInterval(interval);
    }, [session]);
    // Real-time Status Sync: Automatically refetch event detail when start/end time is reached
    useEffect(() => {
        if (!session || !activeSessionId)
            return;
        const now = new Date();
        const startStr = session.voting_start || session.start_date;
        const endStr = session.voting_end || session.end_date;
        if (!startStr || !endStr)
            return;
        const start = new Date(startStr);
        const end = new Date(endStr);
        let nextEvent = null;
        if (now < start)
            nextEvent = start;
        else if (now < end)
            nextEvent = end;
        if (nextEvent) {
            const delay = nextEvent.getTime() - now.getTime() + 1000;
            const timer = setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ["event-detail", activeSessionId] });
                queryClient.invalidateQueries({ queryKey: ["eligible-events"] });
            }, delay);
            return () => clearTimeout(timer);
        }
    }, [session, activeSessionId, queryClient]);
    // Proxy Delegation State
    const { data: delegation, refetch: refetchDelegation } = useQuery({
        queryKey: ["proxy-delegation", shareholderId, session?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("proxy_delegations")
                .select(`
          *,
          proxy:proxy_id (id, shareholder_name, email)
        `)
                .eq("delegator_id", shareholderId)
                .eq("session_id", session?.id)
                .maybeSingle();
            if (error)
                return null;
            return data;
        },
        enabled: !!shareholderId && !!session?.id,
    });
    const { data: myDelegators } = useQuery({
        queryKey: ["my-delegators", shareholderId, session?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("proxy_delegations")
                .select(`
          *,
          delegator:delegator_id (id, shareholder_name, email)
        `)
                .eq("proxy_id", shareholderId)
                .eq("session_id", session?.id)
                .eq("status", "active");
            if (error)
                return [];
            return data;
        },
        enabled: !!shareholderId && !!session?.id,
    });
    // Blockchain Anchor Data
    const { data: anchorData } = useQuery({
        queryKey: ["block-anchor", session?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("block_anchors")
                .select("*")
                .eq("session_id", session?.id)
                .maybeSingle();
            if (error)
                return null;
            return data;
        },
        enabled: !!session?.id,
    });
    const { data: companyShareholders } = useQuery({
        queryKey: ["company-shareholders", shareholder?.company_id],
        queryFn: () => votingApi.getCompanyShareholders(shareholder.company_id),
        enabled: !!shareholder?.company_id,
    });
    const [isDelegating, setIsDelegating] = useState(false);
    const handleDelegate = async (proxyId) => {
        if (!shareholderId || !session?.id)
            return;
        setIsDelegating(true);
        try {
                        const { error } = await supabase.from("proxy_delegations")
                .insert({
                delegator_id: shareholderId,
                proxy_id: proxyId,
                session_id: session.id,
                status: "active"
            });
            if (error)
                throw error;
            toast.success("Proxy Appointed Successfully");
            refetchDelegation();
        }
        catch (err) {
            toast.error(`Delegation Failed: ${err.message}`);
        }
        finally {
            setIsDelegating(false);
        }
    };
    const isLoading = loadingAuth || loadingEvents || (!!activeSessionId && loadingDetail) || loadingVotes;
    // Process Data for UI: All items have a real, guaranteed resolution_id in PostgreSQL
    const votingItems = useMemo(() => {
        return resolutions?.map((res) => {
            const voteRecord = existingVotes?.find((v) => v.resolution_id === res.id);
            let voteValue = null;
            if (voteRecord) {
                const val = (voteRecord.vote_value || "").toUpperCase();
                if (val === "FOR")
                    voteValue = "FOR";
                else if (val === "AGAINST")
                    voteValue = "AGAINST";
                else if (val === "ABSTAIN")
                    voteValue = "ABSTAIN";
            }
            return {
                id: res.id,
                title: res.title,
                description: res.description || "",
                category: res.resolution_type === "director_election"
                    ? "Director Election"
                    : res.resolution_type === "special"
                        ? "Special Resolution"
                        : "Ordinary Resolution",
                voted: !!voteRecord,
                vote: voteValue,
                voteHash: voteRecord?.vote_hash,
                anchorRoot: anchorData ? anchorData.merkle_root : undefined
            };
        }) || [];
    }, [resolutions, existingVotes, anchorData]);
    const totalVoted = votingItems.filter((item) => item.voted).length;

    // Deactivate credentials once shareholder casts their ballot (MCA Rule 20 single-use credential)
    useEffect(() => {
        if (totalVoted > 0 && shareholderId) {
            supabase
                .from("shareholders")
                .update({ is_credential_used: true })
                .eq("id", shareholderId)
                .then(() => {});
        }
    }, [totalVoted, shareholderId]);

    const startDateStr = session?.voting_start || session?.start_date;
    const endDateStr = session?.voting_end || session?.end_date;
    const hasTimestamps = !!startDateStr && !isNaN(new Date(startDateStr).getTime()) &&
                          !!endDateStr && !isNaN(new Date(endDateStr).getTime());

    const isSessionStarted = session?.status === "open" || session?.is_active || (hasTimestamps && currentTime >= new Date(startDateStr));
    const isSessionExpired = session?.status === "open" ? false : hasTimestamps ? currentTime > new Date(endDateStr) : (session?.status === "closed" || session?.status === "results_finalized" || session?.status === "archived");
    const isSessionActive = (session?.status === "open" || session?.is_active || isSessionStarted) && !isSessionExpired;

    // Fetch Official Scrutinizer Results when voting period concludes
    const { data: sessionResults = [], isLoading: loadingResults } = useQuery({
        queryKey: ["session-results", activeSessionId],
        queryFn: async () => {
            if (!activeSessionId) return [];
            const { data: resData } = await supabase
                .from("resolutions")
                .select("*")
                .or(`voting_session_id.eq.${activeSessionId},session_id.eq.${activeSessionId}`);
            const itemsToCount = (resData && resData.length > 0) ? resData : resolutions;
            if (!itemsToCount || itemsToCount.length === 0) return [];
            return await Promise.all(itemsToCount.map(async (r) => {
                const { data: votes } = await supabase
                    .from("votes")
                    .select("vote_value, weighted_votes")
                    .eq("resolution_id", r.id);
                let forCount = 0, againstCount = 0, abstainCount = 0;
                votes?.forEach(v => {
                    const weight = v.weighted_votes || 1;
                    const val = (v.vote_value || "").toUpperCase();
                    if (val === "FOR") forCount += weight;
                    else if (val === "AGAINST") againstCount += weight;
                    else if (val === "ABSTAIN") abstainCount += weight;
                });
                const total = forCount + againstCount + abstainCount;
                const isSpecial = r.resolution_type === "special";
                const isWinner = isSpecial
                    ? (forCount + againstCount > 0 && forCount >= 3 * againstCount)
                    : (forCount > againstCount);
                return {
                    id: r.id,
                    title: r.title,
                    description: r.description,
                    resolution_type: r.resolution_type,
                    for: forCount,
                    against: againstCount,
                    abstain: abstainCount,
                    total,
                    winner: isWinner,
                };
            }));
        },
        enabled: !!activeSessionId && (isSessionExpired || session?.status === "closed" || session?.status === "results_finalized" || session?.status === "archived"),
    });

    const handleVote = useCallback(async (itemId, voteType) => {
        if (!isSessionStarted) {
            toast.error("Voting Not Started", {
                description: startDateStr ? `The voting period opens at ${new Date(startDateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST. Ballots will unlock automatically.` : "The voting period has not started yet.",
            });
            return;
        }
        if (isSessionExpired) {
            toast.error("Voting Session Closed", {
                description: "The voting window has concluded. Official results are now unsealed below.",
            });
            return;
        }
        if (!isSessionActive) {
            toast.error("Voting Paused", {
                description: "The voting session is currently paused.",
            });
            return;
        }
        const upperVoteType = voteType.toUpperCase();
        // MCA Sections 152 & 162: Each resolution and director election is an independent statutory ballot item.
        // Shareholders are entitled to cast their entitlement (FOR, AGAINST, or ABSTAIN) on each candidate independently.
        if (!shareholderId)
            return;
        // Generate Immutable Audit Hash
        const timestamp = new Date().toISOString();
        const voteHash = await generateVoteHash(shareholderId, itemId, voteType, timestamp);
        // Optimistic Update Object
        const newVote = {
            id: "temp-optimistic-id",
            resolution_id: itemId,
            vote_value: upperVoteType,
            vote_hash: voteHash,
            created_at: timestamp,
        };
        // Update Cache Immediately
        queryClient.setQueryData(["votes", shareholderId], (old) => [...(old || []), newVote]);
        try {
            await votingApi.castVote(itemId, upperVoteType);
            toast.success("Vote securely recorded!", {
                description: "Your vote has been cryptographically recorded on the record date roster.",
            });
            queryClient.invalidateQueries({ queryKey: ["votes"] });
        }
        catch (e) {
            console.error("Error recording vote:", e);
            toast.error(`Vote Failed: ${e.message}`);
            queryClient.setQueryData(["votes", shareholderId], (old) => old?.filter((v) => v.vote_hash !== voteHash) || []);
        }
    }, [isSessionStarted, isSessionExpired, isSessionActive, votingItems, shareholderId, queryClient]);

    if (loadingAuth) {
        return (
            <div className="min-h-screen bg-[#020817] text-white flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mb-4" />
                <p className="text-slate-300 font-semibold text-sm">Verifying shareholder ballot credentials...</p>
            </div>
        );
    }

    if (!sessionAuth?.authenticated || !shareholderId) {
        return (
            <div className="min-h-screen bg-[#020817] text-white flex flex-col items-center justify-center p-4">
                <p className="text-slate-400 mb-4">No active shareholder session found. Redirecting to login...</p>
                <Button onClick={() => navigate("/shareholder-login")} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">
                    Go to Shareholder Login
                </Button>
            </div>
        );
    }
    return (<div className="min-h-screen bg-[#020817] text-white relative selection:bg-blue-500/30">
      <SEO title="Shareholder E-Voting Portal" description="Official e-voting session. Cast your weighted votes securely as per your shareholding on the record date." canonical="/voting-dashboard" noindex={true}/>

      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* Header / Breadcrumbs */}
          <div className="relative z-20 px-5 py-3.5 bg-[#0d1b2a]/95 backdrop-blur-xl border border-white/10 mb-6 rounded-2xl shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-200">
                <Link to="/" className="hover:text-cyan-300 font-semibold transition-colors">Home</Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400"/>
                <span className="text-white font-bold truncate max-w-[220px]">{shareholder?.companies?.company_name}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400"/>
                <span className="text-cyan-300 font-bold">Ballot Portal</span>
                {session?.record_date && (<div className="ml-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                    <Clock className="w-3 h-3"/>
                    Record Date: {new Date(session.record_date).toLocaleDateString()}
                  </div>)}
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-black text-white">{shareholder?.shareholder_name}</p>
                  <p className="text-xs text-cyan-300 font-bold tabular-nums">
                    {shareholder?.shares_held?.toLocaleString()} Voting Shares
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-white/20 text-slate-100 hover:bg-white/10 rounded-xl text-xs font-bold" onClick={() => navigate("/shareholder-analysis")}>
                    <Activity className="w-3.5 h-3.5 mr-1.5 text-cyan-400"/>
                    Analytics
                  </Button>
                  <Button variant="ghost" size="sm" className="hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-bold" onClick={() => {
            localStorage.removeItem("shareholderId");
            queryClient.clear();
            navigate("/shareholder-login");
        }}>
                    <LogOut className="w-3.5 h-3.5 mr-1.5"/>
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Event Inaccessible Alert */}
          {detailError && (<div className="mb-8 p-6 rounded-3xl bg-rose-950/40 border border-rose-500/40 shadow-xl text-center">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2"/>
              <h3 className="text-lg font-bold text-white">Event Ballot Inaccessible</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
                You are not enrolled on the record-date roster for this voting event, or the voting event is not currently active.
              </p>
              {eligibleEvents.length > 0 && (<Button onClick={() => setSearchParams({ event: eligibleEvents[0].id || eligibleEvents[0].session_id })} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">
                  View Eligible Event: {eligibleEvents[0].title}
                </Button>)}
            </div>)}

          {/* Event Switcher Bar */}
          {eligibleEvents.length > 0 && (<div className="mb-6 p-4 rounded-3xl bg-[#0d1b2a]/95 border border-white/20 backdrop-blur-xl shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Layers className="w-4 h-4 text-cyan-400"/>
                  <span>Your Enrolled Voting Events ({eligibleEvents.length})</span>
                </div>
                <span className="text-[11px] text-slate-400">Server verified via record-date roster</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {eligibleEvents.map(evt => {
                const isCurrent = evt.id === activeSessionId || evt.session_id === activeSessionId;
                const typeColors = {
                    AGM: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10",
                    EGM: "border-amber-500/40 text-amber-300 bg-amber-500/10",
                    POSTAL_BALLOT: "border-blue-500/40 text-blue-300 bg-blue-500/10",
                    GENERAL_MEETING: "border-slate-500/40 text-slate-300 bg-slate-500/10",
                };
                const color = typeColors[evt.event_type] || typeColors.GENERAL_MEETING;
                return (<button key={evt.id || evt.session_id} type="button" onClick={() => setSearchParams({ event: evt.id || evt.session_id })} className={`px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 ${isCurrent
                        ? "bg-blue-600 text-white border-cyan-400 shadow-lg ring-2 ring-cyan-400/50"
                        : `${color} hover:bg-white/10 hover:border-white/30`}`}>
                      <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
                        {evt.event_type}
                      </span>
                      <span className="truncate max-w-[200px]">{evt.title}</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full ${evt.status === "open" ? "bg-emerald-500/30 text-emerald-200" : "bg-slate-500/30 text-slate-300"}`}>
                        {evt.status}
                      </span>
                    </button>);
            })}
              </div>
            </div>)}

          {/* Proxy Representation Active Banner */}
          {myDelegators && myDelegators.length > 0 && (<div className="mb-6 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-300 shrink-0"/>
              <div className="text-xs text-indigo-200">
                <span className="font-bold text-white">Proxy Representation Active: </span>
                You are casting ballots on behalf of{" "}
                {myDelegators.map((d, i) => (<span key={d.id} className="font-bold text-white">
                    {d.delegator?.shareholder_name} ({d.delegator?.email})
                    {i < myDelegators.length - 1 ? ", " : ""}
                  </span>))}{" "}
                under verified proxy authorization (Companies Act Section 105).
              </div>
            </div>)}

          {/* EGM Governance Details Banner */}
          {session?.event_type === "EGM" && (<div className="mb-6 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5"/>
              <div className="space-y-1 text-xs text-slate-200">
                <div className="font-bold text-amber-300 flex items-center gap-2">
                  <span>Extraordinary General Meeting (EGM) Governance Notice</span>
                  {session.is_short_notice && (<span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                      Section 101(1) Shorter Notice
                    </span>)}
                </div>
                {session.egm_reason && (<p className="text-slate-300">
                    <span className="font-bold text-white">Requisition Matter: </span>
                    {session.egm_reason}
                  </p>)}
                {session.explanatory_statement_reference && (<p className="text-slate-300">
                    <span className="font-bold text-white">Section 102 Explanatory Statement: </span>
                    {session.explanatory_statement_reference}
                  </p>)}
              </div>
            </div>)}

          {/* Voting Window Live Countdown & Status Banner */}
          {session && (<div className="mb-8">
              <Card className={`border backdrop-blur-xl shadow-2xl rounded-3xl p-6 transition-all ${isLiveNow && session.is_active
                ? "border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-[#0d1b2a]/90 to-blue-950/40"
                : !isSessionStarted
                    ? "border-blue-500/40 bg-gradient-to-r from-blue-950/40 via-[#0d1b2a]/90 to-indigo-950/40"
                    : "border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-[#0d1b2a]/90 to-slate-950/40"}`}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${isLiveNow && session.is_active
                ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                : !isSessionStarted
                    ? "bg-blue-500/20 border-blue-400/40 text-cyan-300"
                    : "bg-amber-500/20 border-amber-400/40 text-amber-300"}`}>
                      {isLiveNow && session.is_active ? (<Vote className="w-6 h-6 animate-pulse"/>) : !isSessionStarted ? (<Hourglass className="w-6 h-6 animate-spin"/>) : (<Clock className="w-6 h-6"/>)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${isLiveNow && session.is_active
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : !isSessionStarted
                    ? "bg-blue-500/20 text-cyan-300 border-blue-500/30"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"}`}>
                          {isLiveNow && session.is_active
                ? "LIVE VOTING WINDOW"
                : !isSessionStarted
                    ? "SCHEDULED SESSION"
                    : "SESSION CONCLUDED"}
                        </span>
                        <h3 className="text-lg font-black text-white">{session.title}</h3>
                      </div>
                      <p className="text-sm text-slate-200 mt-1 font-medium">
                        {isLiveNow && session.is_active
                ? "Ballots are active and ready. Cast your vote on each item below."
                : !isSessionStarted
                    ? "Voting window is scheduled. Ballots will unlock automatically when start time is reached."
                    : "Voting is closed. Official tallies are being anchored to blockchain."}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-3 rounded-2xl bg-black/60 border border-white/15 text-center shrink-0">
                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Timer Status</p>
                    <p className="text-base font-black text-cyan-300 mt-0.5 font-mono">{countdownText || "Calculating..."}</p>
                  </div>
                </div>
              </Card>
            </div>)}

          {/* Statutory Governance Timings Grid (All 5 Parameters) */}
          {session && (
            <div className="mb-8">
              <Card className="border-white/20 bg-[#0d1b2a]/90 backdrop-blur-xl rounded-3xl shadow-xl">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
                    <div>
                      <h3 className="font-bold text-white text-base flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        Statutory Voting & Meeting Schedule
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Authoritative timestamps under Rule 20 of Companies Rules & SEBI LODR Regulation 44.
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${
                      isSessionActive
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : !isSessionStarted
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                    }`}>
                      {isSessionActive
                        ? "Voting Open (Live)"
                        : !isSessionStarted
                        ? "Scheduled (Upcoming)"
                        : "Voting Concluded"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                    {/* 1. Voting State */}
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center gap-1.5 text-cyan-300 text-[11px] font-bold uppercase tracking-wider">
                        <Vote className="w-3.5 h-3.5" />
                        <span>Voting State</span>
                      </div>
                      <p className="text-sm font-black text-white mt-1">
                        {isSessionActive ? "Open (Live)" : !isSessionStarted ? "Scheduled" : "Concluded"}
                      </p>
                      <p className="text-[10px] text-slate-400">Canonical status</p>
                    </div>

                    {/* 2. Voting Start Date & Time */}
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Voting Start</span>
                      </div>
                      <p className="text-xs font-black text-white mt-1">
                        {startDateStr ? new Date(startDateStr).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "Not Scheduled"}
                      </p>
                      <p className="text-[10px] text-slate-400">E-Voting opens</p>
                    </div>

                    {/* 3. Voting End Date & Time */}
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center gap-1.5 text-rose-400 text-[11px] font-bold uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Voting End</span>
                      </div>
                      <p className="text-xs font-black text-white mt-1">
                        {endDateStr ? new Date(endDateStr).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "Not Scheduled"}
                      </p>
                      <p className="text-[10px] text-slate-400">Ballot cutoff</p>
                    </div>

                    {/* 4. Meeting Start Date & Time */}
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center gap-1.5 text-indigo-400 text-[11px] font-bold uppercase tracking-wider">
                        <Video className="w-3.5 h-3.5" />
                        <span>Meeting Start</span>
                      </div>
                      <p className="text-xs font-black text-white mt-1">
                        {session.meeting_date ? new Date(session.meeting_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "TBD"}
                      </p>
                      <p className="text-[10px] text-slate-400">General meeting</p>
                    </div>

                    {/* 5. Meeting End Date & Time */}
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
                        <Video className="w-3.5 h-3.5" />
                        <span>Meeting End</span>
                      </div>
                      <p className="text-xs font-black text-white mt-1">
                        {session.meeting_end_date ? new Date(session.meeting_end_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "TBD"}
                      </p>
                      <p className="text-[10px] text-slate-400">Adjournment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Official Scrutinizer Results Section (Unsealed once voting window finishes) */}
          {(isSessionExpired || session?.status === "closed" || session?.status === "results_finalized" || session?.status === "archived") && (
            <div className="mb-8">
              <Card className="border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-[#0d1b2a]/95 to-slate-950/40 backdrop-blur-xl rounded-3xl shadow-2xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-white/15">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                          Official Results Unsealed
                        </span>
                        <h3 className="font-black text-white text-lg">Scrutinizer Ballot Tallies</h3>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Voting window concluded at {endDateStr ? new Date(endDateStr).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : "cutoff"}. Tallies unsealed pursuant to MCA Rule 20(4)(xii).
                      </p>
                    </div>
                  </div>
                </div>

                {loadingResults ? (
                  <div className="p-8 text-center text-slate-300 text-sm">
                    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Unsealing certified scrutinizer tallies...
                  </div>
                ) : sessionResults.length === 0 ? (
                  <p className="text-xs text-slate-300 text-center py-4">No resolution tallies available.</p>
                ) : (
                  <div className="space-y-4">
                    {sessionResults.map((r) => {
                      const totalVotes = r.total || 0;
                      const forPct = totalVotes > 0 ? ((r.for / totalVotes) * 100).toFixed(1) : "0.0";
                      const againstPct = totalVotes > 0 ? ((r.against / totalVotes) * 100).toFixed(1) : "0.0";
                      const abstainPct = totalVotes > 0 ? ((r.abstain / totalVotes) * 100).toFixed(1) : "0.0";

                      return (
                        <div key={r.id} className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-white text-sm">{r.title}</h4>
                              <p className="text-xs text-slate-400 mt-0.5 capitalize">{r.resolution_type?.replace("_", " ")} Resolution</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${
                              r.winner ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            }`}>
                              {r.winner ? "PASSED (Carried)" : "NOT PASSED"}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1.5">
                            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                              <div style={{ width: `${forPct}%` }} className="bg-emerald-500 transition-all duration-500" title={`FOR: ${forPct}%`} />
                              <div style={{ width: `${againstPct}%` }} className="bg-rose-500 transition-all duration-500" title={`AGAINST: ${againstPct}%`} />
                              <div style={{ width: `${abstainPct}%` }} className="bg-slate-500 transition-all duration-500" title={`ABSTAIN: ${abstainPct}%`} />
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-300 font-bold tabular-nums">
                              <span className="text-emerald-400">FOR: {r.for.toLocaleString()} ({forPct}%)</span>
                              <span className="text-rose-400">AGAINST: {r.against.toLocaleString()} ({againstPct}%)</span>
                              <span className="text-slate-400">ABSTAIN: {r.abstain.toLocaleString()} ({abstainPct}%)</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Virtual Meeting Join Banner */}
          {!isLoading && session?.meeting_link && (<div className="mb-8">
              <Card className="border-cyan-500/30 bg-[#0d1b2a]/90 backdrop-blur-xl shadow-xl rounded-3xl p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
                      <Video className="w-6 h-6"/>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white mb-1">
                        Live Virtual General Meeting Room
                      </h3>
                      <div className="space-y-1 text-sm text-slate-200 font-medium">
                        {session.meeting_date && (<p className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-400"/>
                            {new Date(session.meeting_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>)}
                        {session.meeting_password && (<p className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-400"/>
                            Room Passcode: <span className="font-mono bg-black/60 px-2 py-0.5 rounded text-white border border-white/10">{session.meeting_password}</span>
                          </p>)}
                      </div>
                    </div>
                  </div>

                  <Button size="lg" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg gap-2" onClick={() => window.open(session.meeting_link, '_blank')}>
                    <Video className="w-4 h-4"/>
                    Join Video Stream
                  </Button>
                </div>
              </Card>
            </div>)}

          {/* Proxy Delegation Section */}
          {!isLoading && session && (<div>
              <AppointProxyCard shareholders={companyShareholders?.filter(s => s.id !== shareholderId) || []} delegation={delegation} isDelegating={isDelegating} onDelegate={handleDelegate}/>
            </div>)}

          {/* Analytics Summary */}
          {!isLoading && (<div className="mb-8">
              <Suspense fallback={<div className="h-48 rounded-xl bg-[#0d1b2a]/60 border border-white/10 animate-pulse"/>}>
                <VotingAnalytics totalResolutions={votingItems.length} votedResolutions={totalVoted} shareholderShares={shareholder?.shares_held || 0} recordDate={session?.record_date}/>
              </Suspense>
            </div>)}

          {/* Voting Items & Ballot Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Vote className="w-6 h-6 text-cyan-400"/>
                Active Ballot Items & Agendas ({votingItems.length})
              </h2>
              <div className="text-xs text-slate-200 flex items-center gap-2 font-bold">
                <Shield className="w-4 h-4 text-emerald-400"/>
                256-Bit SHA Encrypted & Verified
              </div>
            </div>

            <div className="space-y-4">
              {isLoading ? (<>
                  <VotingCardSkeleton />
                  <VotingCardSkeleton />
                  <VotingCardSkeleton />
                </>) : votingItems.length === 0 ? (<Card className="border-white/15 bg-[#0d1b2a]/90 backdrop-blur-xl p-12 text-center rounded-3xl">
                  <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3"/>
                  <h3 className="text-xl font-bold text-white mb-1">No Active Ballot Items</h3>
                  <p className="text-xs text-slate-200 max-w-md mx-auto">
                    The company administrator has not yet registered resolutions or director candidates for this session.
                  </p>
                </Card>) : (votingItems.map((item, index) => (<div key={item.id}>
                    <VotingCard item={item} index={index} onVote={handleVote}/>
                  </div>)))}
            </div>
          </div>

          {/* All Votes Completed Banner */}
          {!isLoading && totalVoted === votingItems.length && votingItems.length > 0 && (<div className="mt-8 p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-[#0d1b2a]/90 to-cyan-950/60 border border-emerald-500/40 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                  <CheckCircle2 className="w-6 h-6"/>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-bold text-white text-lg">All Ballots Cast & Verified</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold">
                      Credentials Deactivated (MCA Rule 20)
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 font-medium mt-1">
                    Your votes are permanently recorded with cryptographic hashes. In compliance with MCA Rule 20 single-use ballot security, your User ID and Password have been deactivated to prevent multiple voting.
                  </p>
                </div>
              </div>
            </div>)}

          {/* Feedback Section */}
          {!isLoading && session && shareholderId && (<div className="mt-8">
              <ShareholderFeedbackForm sessionId={session.id} shareholderId={shareholderId}/>
            </div>)}

        </div>
      </main>
    </div>);
};
export default VotingDashboard;
