import { useState, useEffect, useRef } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import QRCode from "react-qr-code";
import { supabase } from "@/integrations/supabase/client";
import { env } from "@/config/env";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShieldCheck, CreditCard, CheckCircle2, AlertCircle, QrCode } from "lucide-react";
import { toast } from "sonner";
import { triggerConfetti } from "@/lib/confetti";
import { cn } from "@/lib/utils";
const CashfreeGateway = ({ amount, onSuccess, onCancel }) => {
        const [cashfree, setCashfree] = useState(null);
    const [step, setStep] = useState("init");
    const [isSandbox, setIsSandbox] = useState(true);
    const [customerPhone, setCustomerPhone] = useState("9999999999");
    const [useBackend, setUseBackend] = useState(true);
    const [generatedSessionId, setGeneratedSessionId] = useState("");
    const [qrDemoMode, setQrDemoMode] = useState(false);
    const qrContainerRef = useRef(null);
    // Initialize Cashfree SDK
    useEffect(() => {
        const initializeSDK = async () => {
            try {
                const cf = await load({
                    mode: isSandbox ? "sandbox" : "production",
                });
                setCashfree(cf);
            }
            catch (err) {
                console.error("Cashfree SDK failed to load", err);
                toast.error("Failed to load payment system");
            }
        };
        initializeSDK();
    }, [isSandbox]);
    // Generate Session ID (Common for both Tabs)
    const generateSession = async () => {
        if (!useBackend) {
            toast.error("Manual mode removed for security. Enable Backend.");
            return null;
        }
        if (generatedSessionId)
            return generatedSessionId;
        try {
            const { data, error } = await supabase.functions.invoke('create-payment-order', {
                body: {
                    amount: amount,
                    customerPhone: customerPhone,
                    customerId: "USER_" + Math.random().toString(36).substr(2, 9)
                },
                headers: {
                    "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`
                }
            });
            if (error || !data?.payment_session_id) {
                throw new Error(error?.message || "Invalid Response");
            }
            setGeneratedSessionId(data.payment_session_id);
            return data.payment_session_id;
        }
        catch (err) {
            console.error("Backend Error:", err);
            toast.error("Failed to crate order. Check keys in Supabase.");
            return null;
        }
    };
    const handleCheckoutButton = async () => {
        if (!cashfree)
            return;
        setStep("processing");
        const sessionId = await generateSession();
        if (!sessionId) {
            setStep("failed");
            return;
        }
        const checkoutOptions = {
            paymentSessionId: sessionId,
            redirectTarget: "_modal",
        };
                cashfree.checkout(checkoutOptions).then((result) => {
            if (result.error) {
                console.error("User closed payment or error", result.error);
                setStep("failed");
            }
            if (result.redirect)
                console.log("Redirecting");
        });
    };
    // Render QR Code from Cashfree Component
    const renderQrComponent = async () => {
        if (!cashfree) {
            toast.error("Payment SDK not loaded yet. Please wait.");
            return;
        }
        if (!qrContainerRef.current)
            return;
        // Visual indicator that we are working
        qrContainerRef.current.innerHTML = '<p class="text-xs text-muted-foreground animate-pulse">Contacting Secure Backend...</p>';
        let sessionId = "";
        try {
            sessionId = await generateSession();
        }
        catch (e) {
            console.warn("QR Session Gen Failed - using fallback");
        }
        // --- FALLBACK FOR DEMO (If Backend Fails or Manual Mode) ---
        if (!sessionId) {
            // Wait a small delay to ensure the UI transition is smooth
            setTimeout(() => {
                setQrDemoMode(true);
                if (qrContainerRef.current)
                    qrContainerRef.current.innerHTML = ""; // Clear loader
            }, 500);
            return;
        }
        try {
            setQrDemoMode(false);
            if (cashfree.components) {
                const components = cashfree.components();
                const upiQr = components.create("upiQr", {
                    paymentSessionId: sessionId,
                                        onSuccess: (data) => {
                        setStep("success");
                        handleSuccess(data.orderId || "QR_SUCCESS");
                    },
                                        onFailure: (data) => {
                        setStep("failed");
                        console.error('QR failure', data);
                    }
                });
                if (qrContainerRef.current) {
                    qrContainerRef.current.innerHTML = "";
                    upiQr.mount(qrContainerRef.current);
                }
            }
            else {
                toast.error("Cashfree Components not loaded");
            }
        }
        catch (err) {
            console.error("QR Mount Error", err);
            setQrDemoMode(true);
        }
    };
    const handleSuccess = (txnId) => {
        setStep("success");
        triggerConfetti();
        setTimeout(() => onSuccess(txnId), 2500);
    };
    const simulateSuccess = () => {
        setStep("processing");
        setTimeout(() => {
            const mockTxnId = "CF" + Math.random().toString(36).substr(2, 9).toUpperCase();
            handleSuccess(mockTxnId);
        }, 2000);
    };
    // ------------------------------------------------------------------
    // SUCCESS STATE
    // ------------------------------------------------------------------
    if (step === "success") {
        return (<Card className="w-full max-w-md mx-auto shadow-2xl border-emerald-500/20 animate-[popIn_0.5s_ease-out] bg-emerald-50/10 backdrop-blur-sm">
                <CardContent className="pt-12 pb-12 flex flex-col items-center text-center">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"/>
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-[zoomIn_0.5s_ease-out]">
                            <CheckCircle2 className="w-12 h-12 text-white animate-[bounce_1s_infinite_1s]"/>
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold mb-2 text-emerald-600 dark:text-emerald-400 animate-[slideUp_0.5s_ease-out_0.2s_forwards] opacity-0">
                        Payment Successful!
                    </h3>
                    <p className="text-muted-foreground mb-6 text-lg animate-[slideUp_0.5s_ease-out_0.3s_forwards] opacity-0">
                        Registration Unlocked
                    </p>
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-600/70 bg-emerald-100/50 px-4 py-1.5 rounded-full animate-[fadeIn_0.7s_ease-out_0.5s_forwards] opacity-0">
                        <ShieldCheck className="w-3 h-3"/>
                        VERIFIED BY CASHFREE
                    </div>
                </CardContent>
            </Card>);
    }
    // ------------------------------------------------------------------
    // PROCESSING STATE (Modal / Loading)
    // ------------------------------------------------------------------
    if (step === "processing") {
        return (<Card className="w-full max-w-md mx-auto shadow-2xl border-primary/20 animate-in fade-in zoom-in duration-300">
                <CardContent className="pt-16 pb-16 flex flex-col items-center text-center">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"/>
                        <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10"/>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Processing Securely</h3>
                    <p className="text-muted-foreground mb-6">Waiting for payment confirmation...</p>
                </CardContent>
            </Card>);
    }
    // ------------------------------------------------------------------
    // FAILED STATE
    // ------------------------------------------------------------------
    if (step === "failed") {
        return (<Card className="w-full max-w-md mx-auto shadow-2xl border-destructive/20 animate-[shake_0.5s_ease-in-out]">
                <CardContent className="pt-12 pb-12 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6 text-destructive animate-in zoom-in duration-300">
                        <AlertCircle className="w-10 h-10"/>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-destructive">Payment Failed</h3>
                    <p className="text-muted-foreground mb-8">Transaction could not be completed.</p>
                    <Button onClick={() => setStep("init")} variant="default" className="w-full">Try Again</Button>
                </CardContent>
            </Card>);
    }
    // ------------------------------------------------------------------
    // INITIAL STATE (Default)
    // ------------------------------------------------------------------
    return (<Card className="w-full max-w-md mx-auto shadow-2xl border-border/50 animate-[slideUp_0.5s_ease-out]">
            <CardHeader className="bg-muted/30 border-b border-border/50 text-center pb-6">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold text-xs text-purple-600">CF</span>
                </div>
                <CardTitle className="text-xl">Secure Checkout</CardTitle>
                <CardDescription>Powered by Cashfree Payments</CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
                {/* Amount Display */}
                <div className="bg-secondary/5 p-4 rounded-xl border border-secondary/20 flex justify-between items-center mb-6">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Amount to Pay</p>
                        <p className="text-2xl font-bold text-foreground">₹{amount.toFixed(2)}</p>
                    </div>
                    <ShieldCheck className="w-8 h-8 text-primary/40"/>
                </div>

                <Tabs defaultValue="modal" className="w-full" onValueChange={(v) => {
            if (v === "qr")
                renderQrComponent();
        }}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="modal" className="gap-2">
                            <CreditCard className="w-4 h-4"/>
                            Pay via Modal
                        </TabsTrigger>
                        <TabsTrigger value="qr" className="gap-2">
                            <QrCode className="w-4 h-4"/>
                            Scan QR
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: MODAL PAY */}
                    <TabsContent value="modal" className="space-y-4">
                        <div className="space-y-2">
                            <Label>Customer Phone (Optional)</Label>
                            <Input placeholder="9999999999" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="font-mono text-sm"/>
                            <div className="flex items-center gap-2 mt-2">
                                <input type="checkbox" id="backend-mode" checked={useBackend} onChange={(e) => setUseBackend(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"/>
                                <Label htmlFor="backend-mode" className="text-xs text-muted-foreground font-normal">
                                    Use Real Backend (Requires Keys)
                                </Label>
                            </div>
                        </div>

                        <Button onClick={handleCheckoutButton} className="w-full h-12 text-lg gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20" disabled={!cashfree}>
                            {cashfree ? "Pay Now" : "Loading Gateway..."}
                        </Button>

                        <Button variant="outline" onClick={simulateSuccess} className="w-full text-xs h-9 border-dashed border-emerald-500/50 text-emerald-600 hover:bg-emerald-50">
                            Simulate Success (For Demo)
                        </Button>
                    </TabsContent>

                    {/* TAB 2: EMBEDDED QR */}
                    <TabsContent value="qr" className="space-y-4 flex flex-col items-center justify-center min-h-[300px]">
                        {!useBackend && (<div className="text-center text-amber-600 text-xs mb-4 bg-amber-50 p-2 rounded border border-amber-100">
                                Using Demo Mode (Simulation)
                            </div>)}

                        <div id="qr-container" ref={qrContainerRef} className={cn("w-[250px] h-[250px] bg-white rounded-lg shadow-inner flex items-center justify-center border border-dashed border-gray-300", qrDemoMode ? "hidden" : "block")}>
                            <p className="text-xs text-muted-foreground">Generating QR...</p>
                        </div>

                        {qrDemoMode && (<div className="flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-500">
                                <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100">
                                    <QRCode value={`upi://pay?pa=demo@cashfree&pn=VoteIndia&am=${amount}&cu=INR`} size={180}/>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <p className="text-[10px] uppercase font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                                        Demo Verification
                                    </p>
                                    <Button size="sm" variant="ghost" className="h-6 text-xs text-muted-foreground hover:text-primary" onClick={simulateSuccess}>
                                        Click to Simulate Scan
                                    </Button>
                                </div>
                            </div>)}
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => renderQrComponent()} className="h-8 text-xs">
                                Refresh QR
                            </Button>
                        </div>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                            Scan with any UPI App (GPay, PhonePe, Paytm)
                        </p>
                    </TabsContent>
                </Tabs>
            </CardContent>

            <style>{`
                @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
                @keyframes popIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                @keyframes zoomIn { from { transform: scale(0); } to { transform: scale(1); } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes translateX { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
            `}</style>
        </Card>);
};
export default CashfreeGateway;
