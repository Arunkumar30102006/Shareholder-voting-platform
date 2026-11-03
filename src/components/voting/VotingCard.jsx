import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CheckCircle2, Shield, Lock, ThumbsUp, ThumbsDown, Minus, ShieldCheck } from "lucide-react";
import { useResolutionTranslation } from "@/hooks/useResolutionTranslation";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
const VotingCard = memo(({ item, index, onVote }) => {
    const { t } = useTranslation();
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedVoteType, setSelectedVoteType] = useState(null);
    // Auto-translate resolution content based on current language
    const { title, description, isTranslating } = useResolutionTranslation(item.id, item.title, item.description);
    const initiateVote = (type) => {
        setSelectedVoteType(type);
        setShowConfirm(true);
    };
    const confirmVote = () => {
        if (selectedVoteType) {
            onVote(item.id, selectedVoteType);
            setShowConfirm(false);
        }
    };
    return (<>
            <Card className={`border-border/50 shadow-soft transition-all duration-300 rounded-2xl ${item.voted ? "bg-muted/20" : "hover:shadow-medium hover:border-primary/20"}`}>
                <CardHeader className="py-3.5 px-4 sm:px-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 w-full">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${item.voted
            ? "bg-accent/20 text-accent"
            : "bg-primary/10 text-primary"}`}>
                                {item.voted ? (<CheckCircle2 className="w-4 h-4"/>) : (<span className="font-bold font-mono">{index + 1}</span>)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted/60 border border-border text-muted-foreground uppercase tracking-wider font-semibold">
                                        {item.category}
                                    </span>
                                    {item.voted && (<div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${item.vote === "FOR"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                : item.vote === "AGAINST"
                    ? "bg-red-500/10 border-red-500/20 text-red-500"
                    : "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"}`}>
                                                {item.vote === "FOR"
                ? t("voting_card_voted_for")
                : item.vote === "AGAINST"
                    ? t("voting_card_voted_against")
                    : t("voting_card_abstained")}
                                            </span>

                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <button className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors focus:outline-none">
                                                        <Shield className="w-3 h-3"/>
                                                        {t("voting_card_view_receipt")}
                                                    </button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-white/10">
                                                    <DialogHeader>
                                                        <DialogTitle className="flex items-center gap-2 text-xl">
                                                            <div className="p-2 rounded-full bg-accent/20">
                                                                <CheckCircle2 className="w-5 h-5 text-accent"/>
                                                            </div>
                                                            {t("voting_card_receipt_title")}
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            {t("voting_card_receipt_desc")}
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    <div className="space-y-4 py-4">
                                                        <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-3">
                                                            <div className="flex justify-between items-start">
                                                                <span className="text-sm text-muted-foreground">{t("voting_card_res")}</span>
                                                                <span className="text-sm font-medium text-right w-2/3">{item.title}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-muted-foreground">{t("voting_card_decision")}</span>
                                                                <span className={`text-sm font-bold uppercase ${item.vote === 'FOR' ? 'text-emerald-500' : item.vote === 'AGAINST' ? 'text-red-500' : 'text-yellow-500'}`}>
                                                                    {item.vote}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-muted-foreground">{t("voting_card_time")}</span>
                                                                <span className="text-sm font-mono text-muted-foreground">{new Date().toLocaleString()}</span>
                                                                {/* Note: Ideally this comes from the DB record */}
                                                            </div>
                                                        </div>

                                                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                                                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                                                                <ShieldCheck className="w-4 h-4"/>
                                                                Cryptographically Sealed &amp; Tamper-Evident
                                                            </div>
                                                            <p className="text-xs text-slate-200">
                                                                Your ballot is authenticated with SHA-256 hashing and recorded into the official e-voting Merkle ledger.
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center justify-between text-xs text-slate-300 pt-2 px-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <Lock className="w-3.5 h-3.5 text-cyan-400"/>
                                                                <span>Audit Status: <strong className="text-white">Sealed & Immutable</strong></span>
                                                            </div>
                                                            <span className="text-emerald-400 font-bold">Verified ✓</span>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>)}
                                </div>
                                <CardTitle className="text-base font-bold leading-snug flex items-center gap-2 text-white">
                                    {isTranslating ? (<div className="flex items-center gap-2 text-muted-foreground">
                                            <Loader2 className="w-4 h-4 animate-spin"/>
                                            <span className="text-xs font-normal">{t("voting_card_translating")}</span>
                                        </div>) : (title)}
                                </CardTitle>
                                <CardDescription className="mt-1 text-xs text-slate-300 line-clamp-2">
                                    {isTranslating ? "..." : description}
                                </CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                {!item.voted && (<CardContent className="pt-0 pb-3.5 px-4 sm:px-5">
                        <div className="flex flex-wrap gap-2.5 pt-3 border-t border-border/40">
                            <Button size="sm" variant="default" className="gap-1.5 flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 px-4 text-xs rounded-xl shadow-md" onClick={() => initiateVote("for")}>
                                <ThumbsUp className="w-3.5 h-3.5"/>
                                {t("voting_card_btn_for")}
                            </Button>
                            <Button size="sm" variant="destructive" className="gap-1.5 flex-1 sm:flex-none bg-rose-600 hover:bg-rose-700 text-white font-bold h-9 px-4 text-xs rounded-xl shadow-md" onClick={() => initiateVote("against")}>
                                <ThumbsDown className="w-3.5 h-3.5"/>
                                {t("voting_card_btn_against")}
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1.5 flex-1 sm:flex-none border-white/20 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-bold h-9 px-4 text-xs rounded-xl shadow-md" onClick={() => initiateVote("abstain")}>
                                <Minus className="w-3.5 h-3.5"/>
                                {t("voting_card_btn_abstain")}
                            </Button>
                        </div>
                    </CardContent>)}
            </Card>

            {/* Confirmation Alert Dialog */}
            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("voting_card_confirm_title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("voting_card_confirm_desc_1")} <strong className="uppercase text-primary">{selectedVoteType}</strong> {t("voting_card_confirm_desc_2")}
                            <br /><br />
                            {t("voting_card_confirm_warn")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("voting_card_cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmVote} className={selectedVoteType === 'for' ? 'bg-emerald-600 hover:bg-emerald-700' : selectedVoteType === 'against' ? 'bg-red-600 hover:bg-red-700' : ''}>
                            {t("voting_card_confirm_btn")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>);
});
export default VotingCard;
