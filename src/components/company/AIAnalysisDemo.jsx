import { useState, useEffect } from 'react';
import { SentimentWidget } from '@/components/ai/SentimentWidget';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Search, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { votingApi } from '@/services/api/voting';
import { toast } from 'sonner';
export const AIAnalysisDemo = () => {
    const [text, setText] = useState("");
    const [analyzeText, setAnalyzeText] = useState("");
    const [sessionId, setSessionId] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isAddingToLive, setIsAddingToLive] = useState(false);
    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user)
                return;
            const { data: admin } = await supabase.from('company_admins').select('company_id').eq('user_id', session.user.id).single();
            if (admin) {
                const session = await votingApi.getActiveSession(admin.company_id);
                if (session)
                    setSessionId(session.id);
            }
        };
        fetchSession();
    }, []);
    const handlePushToLive = async () => {
        if (!sessionId || !analysisResult) {
            toast.error("No active voting session or analysis result found.");
            return;
        }
        setIsAddingToLive(true);
        try {
            await votingApi.submitFeedback({
                session_id: sessionId,
                content: analyzeText,
                sentiment_label: analysisResult.sentiment,
                sentiment_score: analysisResult.score,
                themes: analysisResult.themes || [],
            });
            toast.success("Added to Live Stream!");
        }
        catch (error) {
            console.error("Error pushing to live:", error);
            toast.error("Failed to add to live stream.");
        }
        finally {
            setIsAddingToLive(false);
        }
    };
    return (<div className="space-y-4">
            <Textarea placeholder="e.g. 'I am very happy with the new director appointment, but the dividend rollout was delayed and frustrating.'" className="min-h-[120px] resize-none" value={text} onChange={(e) => {
            setText(e.target.value);
            if (analyzeText) {
                setAnalyzeText("");
                setAnalysisResult(null);
            }
        }}/>
            <Button onClick={() => {
            setAnalyzeText(text);
            setAnalysisResult(null); // Reset for new analysis
        }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={!text.trim()}>
                <Search className="w-4 h-4 mr-2"/>
                Analyze Feedback
            </Button>

            {analyzeText && (<div className="mt-4 pt-4 space-y-4">
                    <SentimentWidget feedbackText={analyzeText} onResult={setAnalysisResult}/>

                    <Button variant="outline" size="sm" className="w-full border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50" onClick={handlePushToLive} disabled={isAddingToLive || !analysisResult}>
                        {isAddingToLive ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Send className="w-4 h-4 mr-2"/>}
                        Push to Live Feedback Stream (Demo)
                    </Button>
                </div>)}
        </div>);
};
