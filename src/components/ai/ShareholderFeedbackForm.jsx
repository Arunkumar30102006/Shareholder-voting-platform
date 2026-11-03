import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { env } from '@/config/env';
import { votingApi } from '@/services/api/voting';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MessageSquare, Send, Loader2, Sparkles } from 'lucide-react';
export const ShareholderFeedbackForm = ({ sessionId, shareholderId }) => {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim())
            return;
        setIsSubmitting(true);
        try {
            // 1. Analyze Sentiment via AI Edge Function
            const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-ops', {
                body: { action: 'sentiment', payload: { text: content } },
                headers: {
                    "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`
                }
            });
            if (aiError)
                throw aiError;
            const result = aiData.result;
            // 2. Persist to Database
            await votingApi.submitFeedback({
                session_id: sessionId,
                shareholder_id: shareholderId,
                content: content.trim(),
                sentiment_label: result.sentiment,
                sentiment_score: result.score,
                themes: result.themes || [],
            });
            toast.success("Feedback submitted!", {
                description: "Thank you for your valuable input."
            });
            setContent("");
        }
        catch (error) {
            console.error("Error submitting feedback:", error);
            toast.error("Failed to submit feedback. Please try again.");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<Card className="border-purple-500/20 bg-purple-50/50 dark:bg-purple-900/10">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-600"/>
                    Share Your Feedback
                </CardTitle>
                <CardDescription>
                    Your thoughts help us improve governance. Analysis is powered by AI.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea placeholder="What do you think about the resolutions or the meeting flow?" className="min-h-[100px] bg-background resize-none" value={content} onChange={(e) => setContent(e.target.value)} disabled={isSubmitting}/>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                            <Sparkles className="w-3 h-3 text-purple-500"/>
                            AI will analyze sentiment automatically
                        </div>
                        <Button type="submit" disabled={isSubmitting || !content.trim()} className="bg-purple-600 hover:bg-purple-700 text-white">
                            {isSubmitting ? (<Loader2 className="w-4 h-4 mr-2 animate-spin"/>) : (<Send className="w-4 h-4 mr-2"/>)}
                            Submit Feedback
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>);
};
