import { useState } from "react";
import { MessageSquare, Star, Loader2, Send, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { env } from "@/config/env";
export const DashboardFeedback = ({ email, companyName }) => {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [category, setCategory] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const categories = [
        { value: "feature_request", label: "Feature Request" },
        { value: "bug_report", label: "Report a Bug" },
        { value: "billing", label: "Billing & Account" },
        { value: "other", label: "Other" },
    ];
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please provide a rating");
            return;
        }
        if (!category) {
            toast.error("Please select a category");
            return;
        }
        setIsSubmitting(true);
        try {
            const { data: result, error: functionError } = await supabase.functions.invoke('send-feedback-to-sheet', {
                body: {
                    type: "dashboard",
                    rating,
                    category,
                    companyName,
                    message: `[Category: ${category}] ${message}`,
                    email: email,
                },
                headers: {
                    "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`,
                    "apikey": env.SUPABASE_ANON_KEY
                }
            });
            if (functionError) {
                throw new Error(functionError.message || "Failed to submit feedback");
            }
            toast.success("Feedback sent to support team!");
            setOpen(false);
            setRating(0);
            setMessage("");
            setCategory("");
        }
        catch (error) {
            console.error("Feedback error:", error);
            toast.error(error.message || "Failed to submit feedback");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-primary"/>
                            Help & Support
                        </CardTitle>
                        <CardDescription>
                            Have an issue or suggestion? ID: Google Ref
                        </CardDescription>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <MessageSquare className="w-4 h-4"/>
                                Send Feedback
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Dashboard Feedback</DialogTitle>
                                <DialogDescription>
                                    Your feedback goes directly to our Google Sheet for review.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4 py-2">
                                {/* Rating */}
                                <div className="flex flex-col items-center justify-center gap-2 mb-4">
                                    <Label>Rate your dashboard experience</Label>
                                    <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                                        {[1, 2, 3, 4, 5].map((star) => (<button type="button" key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} className="p-1 transition-all duration-200 hover:scale-110 focus:outline-none">
                                                <Star className={`w-8 h-8 ${star <= (hoverRating || rating)
                ? "fill-primary text-primary drop-shadow-sm"
                : "text-muted-foreground/30"}`}/>
                                            </button>))}
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label>Topic</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a topic"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (<SelectItem key={cat.value} value={cat.label}>
                                                    {cat.label}
                                                </SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Message */}
                                <div className="space-y-2">
                                    <Label>Message</Label>
                                    <Textarea placeholder="Describe your issue or suggestion..." value={message} onChange={(e) => setMessage(e.target.value)} className="resize-none min-h-[100px]" required/>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting} className="gap-2">
                                        {isSubmitting ? (<Loader2 className="h-4 w-4 animate-spin"/>) : (<Send className="h-4 w-4"/>)}
                                        Submit
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
        </Card>);
};
