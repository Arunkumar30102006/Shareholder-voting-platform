import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { env } from '@/config/env';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, ThumbsUp, ThumbsDown, Minus, BrainCircuit, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
export const SentimentWidget = ({ feedbackText, onResult }) => {
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        const analyzeSentiment = async () => {
            if (!feedbackText)
                return;
            setIsLoading(true);
            try {
                const { data, error } = await supabase.functions.invoke('ai-ops', {
                    body: { action: 'sentiment', payload: { text: feedbackText } },
                    headers: {
                        "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`
                    }
                });
                if (error)
                    throw error;
                setResult(data.result);
                if (onResult)
                    onResult(data.result);
            }
            catch (error) {
                console.error('Error analyzing sentiment:', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        analyzeSentiment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [feedbackText]);
    if (!feedbackText)
        return null;
    const SentimentContent = () => (<div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {result?.sentiment === 'Positive' && <ThumbsUp className="h-5 w-5 text-green-500"/>}
                    {result?.sentiment === 'Neutral' && <Minus className="h-5 w-5 text-gray-500"/>}
                    {result?.sentiment === 'Negative' && <ThumbsDown className="h-5 w-5 text-red-500"/>}
                    <span className={`text-lg font-bold ${result?.sentiment === 'Positive' ? 'text-green-600' :
            result?.sentiment === 'Negative' ? 'text-red-600' : 'text-gray-600'}`}>
                        {result?.sentiment}
                    </span>
                </div>
                <Badge variant="outline" className="text-xs">
                    {Math.round((result?.score || 0) * 100)}% Confidence
                </Badge>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Negative</span>
                    <span>Neutral</span>
                    <span>Positive</span>
                </div>
                <Progress value={(((result?.score || 0) + 1) / 2) * 100} className="h-2 bg-gray-200 dark:bg-gray-700"/>
            </div>

            <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Key Themes</h4>
                <div className="flex flex-wrap gap-2">
                    {result?.themes && result.themes.length > 0 ? (result.themes.map((theme, i) => (<Badge key={i} variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                {theme}
                            </Badge>))) : (<span className="text-xs text-muted-foreground">No themes detected</span>)}
                </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 italic border border-indigo-100 dark:border-indigo-800/30">
                "{result?.summary}"
            </div>
        </div>);
    return (<Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Card className="w-full bg-primary/5 dark:bg-primary/5 border-primary/10 transition-all cursor-pointer hover:bg-primary/10" onClick={() => setIsOpen(true)}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="h-5 w-5 text-indigo-500"/>
                            AI Sentiment Analysis
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                            <Maximize2 className="h-4 w-4"/>
                        </Button>
                    </CardTitle>
                    <CardDescription>Click to view detailed analysis</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (<div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                            <Loader2 className="h-4 w-4 animate-spin"/>
                            Analyzing...
                        </div>) : result ? (<div className="flex items-center gap-3">
                            {result.sentiment === 'Positive' && <ThumbsUp className="h-5 w-5 text-green-500"/>}
                            {result.sentiment === 'Neutral' && <Minus className="h-5 w-5 text-gray-500"/>}
                            {result.sentiment === 'Negative' && <ThumbsDown className="h-5 w-5 text-red-500"/>}
                            <div>
                                <div className="font-semibold">{result.sentiment} Sentiment</div>
                                <div className="text-xs text-muted-foreground line-clamp-1">{result.summary}</div>
                            </div>
                        </div>) : (<div className="text-sm text-gray-500">No analysis available.</div>)}
                </CardContent>
            </Card>

            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <BrainCircuit className="h-6 w-6 text-indigo-500"/>
                        Detailed Sentiment Analysis
                    </DialogTitle>
                </DialogHeader>
                {isLoading ? (<div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4"/>
                        <p className="text-muted-foreground">Processing feedback...</p>
                    </div>) : (<SentimentContent />)}
            </DialogContent>
        </Dialog>);
};
